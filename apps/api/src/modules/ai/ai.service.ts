import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';

interface ParsedResponse {
  type?: 'income' | 'expense';
  amount?: number;
  categoryName?: string;
  walletName?: string;
  note?: string;
  date?: string;
}

interface ParsedReceiptResponse {
  isReceipt: boolean;
  amount: number;
  merchant: string;
  note?: string;
  date?: string;
  categoryName?: string;
  walletName?: string;
}

export interface ScannedMutationItem {
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  amount: number;
  description: string;
  note: string;
  categoryId: string | null;
  walletId: string | null;
  isDuplicate: boolean;
}

export interface FinancialInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  actionLabel?: string | null;
  actionUrl?: string | null;
}

@Injectable()
export class AiService {
  private ai: GoogleGenAI;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async parseTransactionText(workspaceId: string, text: string) {
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    ) {
      throw new InternalServerErrorException(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in the backend .env file.',
      );
    }

    // 1. Ambil daftar kategori & dompet di workspace aktif agar menjadi context pencocokan AI
    const [categories, wallets] = await Promise.all([
      this.prisma.category.findMany({ where: { workspaceId } }),
      this.prisma.wallet.findMany({ where: { workspaceId } }),
    ]);

    const categoryNames = categories.map((c) => c.name);
    const walletNames = wallets.map((w) => w.name);

    // 2. Definisikan Response Schema JSON sesuai Google Gen AI SDK
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          enum: ['income', 'expense'],
          description:
            'Tipe transaksi: income jika pemasukan, expense jika pengeluaran',
        },
        amount: {
          type: Type.INTEGER,
          description:
            'Jumlah uang / nominal transaksi angka bulat tanpa koma/titik desimal',
        },
        categoryName: {
          type: Type.STRING,
          enum: categoryNames.length > 0 ? categoryNames : undefined,
          description: 'Nama kategori terdekat dari daftar kategori valid',
        },
        walletName: {
          type: Type.STRING,
          enum: walletNames.length > 0 ? walletNames : undefined,
          description: 'Nama dompet terdekat dari daftar dompet valid',
        },
        note: {
          type: Type.STRING,
          description: 'Catatan ringkas detail pengeluaran/pemasukan',
        },
        date: {
          type: Type.STRING,
          description: 'Tanggal transaksi dalam format YYYY-MM-DD',
        },
      },
      required: ['type', 'amount'],
    };

    const expenseCategories = categories
      .filter((c) => c.type === 'expense')
      .map((c) => c.name);
    const incomeCategories = categories
      .filter((c) => c.type === 'income')
      .map((c) => c.name);

    // 3. Siapkan Prompt untuk AI
    const systemInstruction = `Kamu adalah asisten pengelola keuangan pintar Indonesia.
Tugasmu adalah menganalisis pesan teks transaksi pengguna dan mengekstraknya menjadi JSON terstruktur.
Tanggal hari ini adalah: ${new Date().toISOString().split('T')[0]}.
PENTING:
- Jika transaksi adalah pengeluaran (expense), kamu HARUS memilih kategori dari daftar Kategori Pengeluaran Valid.
- Jika transaksi adalah pemasukan (income), kamu HARUS memilih kategori dari daftar Kategori Pemasukan Valid.
- Pilihlah nama dompet terdekat yang paling logis dari daftar dompet valid.`;

    const contents = `Teks Transaksi: "${text}"

Daftar Kategori Pengeluaran Valid (Hanya untuk tipe expense): ${JSON.stringify(expenseCategories)}
Daftar Kategori Pemasukan Valid (Hanya untuk tipe income): ${JSON.stringify(incomeCategories)}
Daftar Dompet Valid: ${JSON.stringify(walletNames)}`;

    try {
      // 4. Panggil Google Gemini API
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1, // Nilai rendah agar hasil lebih deterministik
        },
      });

      if (!response.text) {
        throw new Error('Empty response received from Gemini API');
      }

      const parsed = JSON.parse(response.text) as ParsedResponse;

      // 5. Cari ID yang cocok dari database lokal berdasarkan nama hasil parsing AI dan tipe transaksi
      const matchedCategory = categories.find(
        (c) =>
          c.name.toLowerCase() === parsed.categoryName?.toLowerCase() &&
          c.type === parsed.type,
      );
      const matchedWallet = wallets.find(
        (w) => w.name.toLowerCase() === parsed.walletName?.toLowerCase(),
      );

      // Cari fallback category yang sesuai tipe transaksi jika tidak ada yang cocok
      const fallbackCategory = categories.find((c) => c.type === parsed.type);

      return {
        type: parsed.type || 'expense',
        amount: parsed.amount || 0,
        categoryId: matchedCategory?.id || (fallbackCategory?.id ?? null),
        walletId: matchedWallet?.id || (wallets[0]?.id ?? null),
        note: toTitleCase(parsed.note || text),
        transactionDate: parsed.date || new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to parse transaction using AI: ${message}`,
      );
    }
  }

  private getCacheFilePath(workspaceId: string): string {
    const cacheDir = path.join(process.cwd(), '.cache', 'ai-insights');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    return path.join(cacheDir, `${workspaceId}.json`);
  }

  private getCachedInsights(
    workspaceId: string,
  ): { timestamp: number; data: FinancialInsight[] } | null {
    try {
      const filePath = this.getCacheFilePath(workspaceId);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent) as {
          timestamp: number;
          data: FinancialInsight[];
        };
      }
    } catch {
      // Ignore reading errors
    }
    return null;
  }

  private setCachedInsights(workspaceId: string, data: FinancialInsight[]) {
    try {
      const filePath = this.getCacheFilePath(workspaceId);
      fs.writeFileSync(
        filePath,
        JSON.stringify({ timestamp: Date.now(), data }),
        'utf-8',
      );
    } catch {
      // Ignore writing errors
    }
  }

  invalidateInsightsCache(workspaceId: string) {
    try {
      const filePath = this.getCacheFilePath(workspaceId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore deletion errors
    }
  }

  async scanReceipt(workspaceId: string, file: Express.Multer.File) {
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    ) {
      throw new InternalServerErrorException(
        'Gemini API key is not configured. Please set GEMINI_API_KEY in the backend .env file.',
      );
    }

    const [categories, wallets] = await Promise.all([
      this.prisma.category.findMany({ where: { workspaceId } }),
      this.prisma.wallet.findMany({ where: { workspaceId } }),
    ]);

    const categoryNames = categories.map((c) => c.name);
    const walletNames = wallets.map((w) => w.name);

    const expenseCategories = categories
      .filter((c) => c.type === 'expense')
      .map((c) => c.name);

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isReceipt: {
          type: Type.BOOLEAN,
          description:
            'Apakah gambar ini benar-benar struk, nota, atau invoice belanja? Set true jika ya, dan false jika gambar wajah/profil, selfie, pemandangan, atau benda acak lain yang bukan bukti belanja.',
        },
        amount: {
          type: Type.INTEGER,
          description:
            'Total nominal belanja (angka saja tanpa titik/koma desimal). Jika bukan struk, isi 0.',
        },
        merchant: {
          type: Type.STRING,
          description:
            'Nama merchant/toko tempat pembelian secara singkat. Jika bukan struk, isi "Tidak Diketahui".',
        },
        note: {
          type: Type.STRING,
          description:
            'Daftar item belanjaan utama yang dipisahkan oleh baris baru dan diawali tanda hubung (format: "- Item 1\\n- Item 2"). Gunakan huruf kapital di awal setiap item. Jika bukan struk, isi "".',
        },
        date: {
          type: Type.STRING,
          description:
            'Tanggal transaksi dalam format YYYY-MM-DD. Jika bukan struk, isi hari ini.',
        },
        categoryName: {
          type: Type.STRING,
          enum: categoryNames.length > 0 ? categoryNames : undefined,
          description: 'Nama kategori terdekat dari daftar kategori valid',
        },
        walletName: {
          type: Type.STRING,
          enum: walletNames.length > 0 ? walletNames : undefined,
          description: 'Nama dompet terdekat dari daftar dompet valid',
        },
      },
      required: ['isReceipt', 'amount', 'merchant'],
    };

    const systemInstruction = `Kamu adalah asisten pengolah struk belanja pintar Indonesia untuk aplikasi "Teman Kas".
Tugasmu adalah menganalisis foto yang diberikan. 
PENTING: Tentukan apakah gambar ini merupakan sebuah struk belanja, nota, atau invoice. 
- Jika YA (merupakan struk belanja): set isReceipt ke true, lalu ekstrak total nominal, merchant, catatan barang belanjaan, tanggal, kategori, dan dompet.
- Jika TIDAK (misalnya gambar adalah foto profil wajah, selfie, hewan peliharaan, pemandangan, screenshot layar chat, atau gambar acak non-struk): set isReceipt ke false, set amount ke 0, dan merchant ke "Bukan Struk".

Pilih kategori terdekat yang paling logis dari daftar Kategori Valid.
Pilih dompet terdekat dari daftar Dompet Valid berdasarkan cara pembayaran (misal jika ada tulisan "CASH" atau uang tunai pilih dompet tunai/cash, jika debit/QRIS pilih bank/e-wallet).`;

    const contents = [
      {
        inlineData: {
          data: file.buffer.toString('base64'),
          mimeType: file.mimetype,
        },
      },
      `Daftar Kategori Valid (Hanya untuk pengeluaran): ${JSON.stringify(expenseCategories)}
Daftar Dompet Valid: ${JSON.stringify(walletNames)}`,
    ];

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1,
        },
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }

      const parsed = JSON.parse(response.text) as ParsedReceiptResponse;

      if (parsed.isReceipt === false) {
        throw new BadRequestException(
          'Gambar yang diunggah tidak terdeteksi sebagai struk belanja.',
        );
      }

      const matchedCategory = categories.find(
        (c) =>
          c.name.toLowerCase() === parsed.categoryName?.toLowerCase() &&
          c.type === 'expense',
      );
      const matchedWallet = wallets.find(
        (w) => w.name.toLowerCase() === parsed.walletName?.toLowerCase(),
      );

      const fallbackCategory = categories.find((c) => c.type === 'expense');

      const formattedNote = parsed.note
        ? `Belanja Di ${toTitleCase(parsed.merchant)}\n${parsed.note}`
        : `Belanja Di ${toTitleCase(parsed.merchant)}`;

      return {
        type: 'expense',
        amount: parsed.amount || 0,
        categoryId: matchedCategory?.id || (fallbackCategory?.id ?? null),
        walletId: matchedWallet?.id || (wallets[0]?.id ?? null),
        note: formattedNote,
        transactionDate: parsed.date || new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to scan receipt using AI: ${message}`,
      );
    }
  }

  async getInsights(
    workspaceId: string,
    force = false,
  ): Promise<FinancialInsight[]> {
    const now = Date.now();
    const cached = this.getCachedInsights(workspaceId);

    // Cache valid selama 6 jam (kecuali dipaksa force refresh)
    if (!force && cached && now - cached.timestamp < 6 * 60 * 60 * 1000) {
      return cached.data;
    }

    // Jika tidak dipaksa (force=false) dan tidak ada cache, kembalikan kosong secara instan untuk menghindari loading awal yang lama
    if (!force && !cached) {
      return [];
    }

    const data = await this.generateInsights(workspaceId);
    this.setCachedInsights(workspaceId, data);
    return data;
  }

  private async generateInsights(
    workspaceId: string,
  ): Promise<FinancialInsight[]> {
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    ) {
      return [];
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [workspace, transactions, savingsGoals, wallets] = await Promise.all([
      this.prisma.workspace.findUnique({ where: { id: workspaceId } }),
      this.prisma.transaction.findMany({
        where: {
          workspaceId,
          transactionDate: { gte: thirtyDaysAgo },
        },
        include: { category: true },
      }),
      this.prisma.savingsGoal.findMany({ where: { workspaceId } }),
      this.prisma.wallet.findMany({ where: { workspaceId } }),
    ]);

    if (!workspace) return [];

    // Agregasikan pengeluaran & pemasukan
    let totalIncome = 0;
    let totalExpense = 0;
    const categorySpending: Record<string, { total: number; group?: string }> =
      {};

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        const catName = tx.category?.name || 'Lainnya';
        if (!categorySpending[catName]) {
          categorySpending[catName] = {
            total: 0,
            group: tx.category?.group || undefined,
          };
        }
        categorySpending[catName].total += amt;
      }
    });

    const goalsSummary = savingsGoals.map((g) => ({
      name: g.name,
      target: Number(g.targetAmount),
      current: Number(g.currentAmount),
      targetDate: g.targetDate.toISOString().split('T')[0],
    }));

    const walletSummaries = wallets.map((w) => ({
      name: w.name,
      balance: Number(w.balance),
      type: w.type,
    }));

    const dailySpending: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense') {
        const dateStr = tx.transactionDate.toISOString().slice(0, 10);
        dailySpending[dateStr] =
          (dailySpending[dateStr] || 0) + Number(tx.amount);
      }
    });

    // Urutkan daily spending
    const dailySpendingTrend = Object.keys(dailySpending)
      .sort()
      .map((date) => ({ date, amount: dailySpending[date] }));

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: {
            type: Type.STRING,
            enum: ['warning', 'success', 'info'],
          },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          actionLabel: {
            type: Type.STRING,
            description: 'Label tombol aksi (opsional, null jika tidak perlu)',
          },
          actionUrl: {
            type: Type.STRING,
            description:
              'Link tujuan halaman (opsional, contoh "/reports", "/wallets", "/savings-goals")',
          },
        },
        required: ['id', 'type', 'title', 'description'],
      },
    };

    const systemInstruction = `Kamu adalah penasihat keuangan pribadi (financial advisor) yang hangat, ramah, jujur, namun menenangkan untuk aplikasi "Teman Kas".
Misi kamu adalah menganalisis data keuangan pengguna dan memberikan maksimal 3 rekomendasi/insight singkat yang relevan.

Aturan Penulisan Insight:
1. Gunakan bahasa Indonesia yang santai, suportif, dan personal (panggil dengan "kamu").
2. Jangan terlalu panjang, maksimal 2-3 kalimat per insight.
3. Hindari kalimat menakut-nakuti. Berikan solusi praktis.
4. Tentukan type untuk setiap insight:
   - "warning": jika ada pemborosan, pengeluaran kategori tidak biasa, atau target tabungan terancam.
   - "success": jika ada pencapaian baik (hemat, tabungan naik, sisa saldo aman).
   - "info": tips keuangan umum berdasarkan data mereka atau perbandingan saldo.

Jika data transaksi pengguna masih sangat sedikit atau kosong, kembalikan tips ramah untuk memulai mencatat transaksi pertama mereka agar AI bisa menganalisis di masa depan.`;

    const contents = `Hari ini tanggal: ${new Date().toISOString().split('T')[0]}.
Data Keuangan Pengguna (30 hari terakhir):
- Alokasi Anggaran Target Workspace (Persen %): Needs=${workspace.needsTarget}%, Wants=${workspace.wantsTarget}%, Savings=${workspace.savingsTarget}%
- Saldo Dompet Saat Ini: ${JSON.stringify(walletSummaries)}
- Total Pemasukan: Rp ${totalIncome}
- Total Pengeluaran: Rp ${totalExpense}
- Pengeluaran Per Kategori: ${JSON.stringify(categorySpending)}
- Tren Pengeluaran Harian: ${JSON.stringify(dailySpendingTrend.slice(-10))} (10 hari terakhir)
- Status Target Tabungan: ${JSON.stringify(goalsSummary)}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
        },
      });

      if (!response.text) return [];

      return JSON.parse(response.text) as FinancialInsight[];
    } catch {
      // Return empty array jika AI gagal/error agar dashboard tidak rusak
      return [];
    }
  }

  async scanMutation(
    workspaceId: string,
    file: Express.Multer.File,
  ): Promise<ScannedMutationItem[]> {
    if (
      !process.env.GEMINI_API_KEY ||
      process.env.GEMINI_API_KEY === 'your_gemini_api_key_here'
    ) {
      throw new InternalServerErrorException(
        'Gemini API key is not configured.',
      );
    }

    const [categories, wallets, existingTx] = await Promise.all([
      this.prisma.category.findMany({ where: { workspaceId } }),
      this.prisma.wallet.findMany({ where: { workspaceId } }),
      this.prisma.transaction.findMany({
        where: { workspaceId },
        select: { amount: true, transactionDate: true },
      }),
    ]);

    const expenseCategories = categories
      .filter((c) => c.type === 'expense')
      .map((c) => c.name);
    const incomeCategories = categories
      .filter((c) => c.type === 'income')
      .map((c) => c.name);
    const walletNames = wallets.map((w) => w.name);

    // Buat set untuk deteksi duplikat: "amount|YYYY-MM-DD"
    const existingSet = new Set(
      existingTx.map(
        (t) =>
          `${Number(t.amount)}|${t.transactionDate.toISOString().slice(0, 10)}`,
      ),
    );

    const isPdf = file.mimetype === 'application/pdf';
    let mutationText = '';

    if (isPdf) {
      // ponytail: inline require untuk CJS interop pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (
        buf: Buffer,
      ) => Promise<{ text: string }>;
      const pdfData = await pdfParse(file.buffer);
      mutationText = pdfData.text;

      if (!mutationText.trim()) {
        throw new BadRequestException(
          'PDF tidak bisa dibaca. Pastikan PDF bukan scan gambar.',
        );
      }
    }

    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: {
            type: Type.STRING,
            description: 'Tanggal transaksi format YYYY-MM-DD',
          },
          type: {
            type: Type.STRING,
            enum: ['income', 'expense'],
            description: 'income jika kredit/masuk, expense jika debit/keluar',
          },
          amount: {
            type: Type.INTEGER,
            description: 'Nominal transaksi (angka saja, tanpa titik/koma)',
          },
          description: {
            type: Type.STRING,
            description: 'Deskripsi asli dari mutasi rekening',
          },
          note: {
            type: Type.STRING,
            description: 'Ringkasan catatan singkat untuk transaksi',
          },
          categoryName: {
            type: Type.STRING,
            description: 'Nama kategori yang paling cocok dari daftar valid',
          },
          walletName: {
            type: Type.STRING,
            description: 'Nama dompet dari daftar valid',
          },
        },
        required: ['date', 'type', 'amount', 'description', 'note'],
      },
    };

    const systemInstruction = `Kamu adalah asisten pembaca mutasi rekening bank Indonesia untuk aplikasi "Teman Kas".
Tugasmu: ekstrak SEMUA transaksi dari mutasi rekening yang diberikan ke format JSON array.

Aturan:
- type "income" untuk transaksi KREDIT (uang masuk/+), "expense" untuk DEBIT (uang keluar/-).
- amount: nominal angka bulat saja (tanpa pemisah ribuan).
- Abaikan baris saldo, header, footer, dan informasi non-transaksi.
- Pilih categoryName dari daftar Kategori Pengeluaran Valid (untuk expense) atau Kategori Pemasukan Valid (untuk income).
- Pilih walletName dari Daftar Dompet Valid yang paling relevan dengan rekening ini.
- Jika tidak bisa menentukan kategori atau dompet, kosongkan (null).
- Kembalikan SEMUA transaksi yang ditemukan.

Kategori Pengeluaran Valid: ${JSON.stringify(expenseCategories)}
Kategori Pemasukan Valid: ${JSON.stringify(incomeCategories)}
Daftar Dompet Valid: ${JSON.stringify(walletNames)}
Tanggal hari ini: ${new Date().toISOString().split('T')[0]}`;

    let contents: Parameters<
      typeof this.ai.models.generateContent
    >[0]['contents'];

    if (isPdf) {
      contents = `${systemInstruction}\n\nIsi Mutasi Rekening (teks dari PDF):\n${mutationText}`;
    } else {
      contents = [
        {
          inlineData: {
            data: file.buffer.toString('base64'),
            mimeType: file.mimetype,
          },
        },
        `${systemInstruction}\n\nAnalisis gambar mutasi rekening di atas dan ekstrak semua transaksi.`,
      ];
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.1,
        },
      });

      if (!response.text) throw new Error('Empty response from Gemini');

      const parsed = JSON.parse(response.text) as Array<{
        date: string;
        type: 'income' | 'expense';
        amount: number;
        description: string;
        note: string;
        categoryName?: string;
        walletName?: string;
      }>;

      return parsed.map((item) => {
        const matchedCategory = categories.find(
          (c) =>
            c.name.toLowerCase() === item.categoryName?.toLowerCase() &&
            c.type === item.type,
        );
        const matchedWallet = wallets.find(
          (w) => w.name.toLowerCase() === item.walletName?.toLowerCase(),
        );
        const fallbackCategory = categories.find((c) => c.type === item.type);
        const fallbackWallet = wallets[0];

        const isDuplicate = existingSet.has(`${item.amount}|${item.date}`);

        return {
          date: item.date,
          type: item.type,
          amount: item.amount,
          description: item.description,
          note: item.note,
          categoryId: matchedCategory?.id ?? fallbackCategory?.id ?? null,
          walletId: matchedWallet?.id ?? fallbackWallet?.id ?? null,
          isDuplicate,
        };
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Gagal membaca mutasi rekening: ${message}`,
      );
    }
  }
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
