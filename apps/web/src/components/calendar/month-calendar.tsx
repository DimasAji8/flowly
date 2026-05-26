"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { formatMonthYear } from "@/utils/format-date";
import { WEEKDAYS_ID, getMonthGrid, isoDate } from "@/utils/calendar";

export interface DayData {
  income: number;
  expense: number;
}

export interface MonthCalendarProps {
  year: number;
  month: number; // 1..12
  data: Map<string, DayData>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  monthlySummary: { income: number; expense: number };
}

export function MonthCalendar({
  year,
  month,
  data,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
  onToday,
}: MonthCalendarProps) {
  const grid = getMonthGrid(year, month);
  const todayIso = isoDate(new Date());
  const isCurrentMonth =
    new Date().getFullYear() === year && new Date().getMonth() + 1 === month;

  return (
    <div className="flex flex-col gap-4">
      {/* Header: navigasi + tombol hari ini */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {formatMonthYear(year, month)}
        </h2>

        <div className="flex items-center gap-1">
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={onToday}
              className="rounded-lg px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft transition-colors"
            >
              Hari Ini
            </button>
          )}
          <IconButton label="Bulan sebelumnya" variant="ghost" size="sm" onClick={onPrev}>
            <ChevronLeft className="size-4" aria-hidden />
          </IconButton>
          <IconButton label="Bulan berikutnya" variant="ghost" size="sm" onClick={onNext}>
            <ChevronRight className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS_ID.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-muted"
          >
            {d}
          </div>
        ))}

        {grid.map((d) => {
          const iso = isoDate(d);
          const inMonth = d.getMonth() + 1 === month;
          const day = data.get(iso);
          const isToday = iso === todayIso;
          const isSelected = iso === selectedDate;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              className={[
                "relative flex flex-col items-center gap-0.5 rounded-xl py-1.5 px-0.5 text-xs transition-colors",
                inMonth
                  ? "text-foreground"
                  : "text-(--color-text-muted)/30 pointer-events-none",
                isSelected
                  ? "bg-accent-soft"
                  : isToday
                    ? "bg-card-subtle"
                    : "hover:bg-card-subtle",
              ].join(" ")}
            >
              {/* Date number */}
              <span
                className={[
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium leading-none",
                  isToday && !isSelected
                    ? "bg-foreground text-background font-semibold"
                    : isSelected
                      ? "text-accent font-semibold"
                      : "",
                ].join(" ")}
              >
                {d.getDate()}
              </span>

              {/* Dots: income + expense */}
              {inMonth && day ? (
                <span className="flex items-center gap-0.5 h-2" aria-hidden>
                  {day.income > 0 && (
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--color-success)" }}
                    />
                  )}
                  {day.expense > 0 && (
                    <span
                      className="size-1.5 rounded-full"
                      style={{ backgroundColor: "var(--color-danger)" }}
                    />
                  )}
                </span>
              ) : (
                <span className="h-2" aria-hidden />
              )}

            </button>
          );
        })}
      </div>
    </div>
  );
}
