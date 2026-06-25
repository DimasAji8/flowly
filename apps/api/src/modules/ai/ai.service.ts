import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { PrismaService } from '../../prisma/prisma.service';

interface ParsedResponse {
  type?: 'income' | 'expense';
  amount?: number;
  categoryName?: string;
  walletName?: string;
  note?: string;
  date?: string;
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
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
