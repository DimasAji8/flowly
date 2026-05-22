/**
 * Util untuk grid kalender bulanan sederhana.
 */

export function getMonthGrid(year: number, month: number): Date[] {
  // month: 1..12
  const first = new Date(year, month - 1, 1);
  // Mulai dari Senin minggu pertama (week starts on Monday)
  const startWeekday = (first.getDay() + 6) % 7; // 0 = Mon
  const start = new Date(year, month - 1, 1 - startWeekday);

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const WEEKDAYS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
