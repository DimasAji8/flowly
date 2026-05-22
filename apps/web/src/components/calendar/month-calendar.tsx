"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { formatMonthYear } from "@/utils/format-date";
import {
  WEEKDAYS_ID,
  getMonthGrid,
  isoDate,
} from "@/utils/calendar";

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
}

export function MonthCalendar({
  year,
  month,
  data,
  selectedDate,
  onSelectDate,
  onPrev,
  onNext,
}: MonthCalendarProps) {
  const grid = getMonthGrid(year, month);
  const todayIso = isoDate(new Date());

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          {formatMonthYear(year, month)}
        </h2>
        <div className="flex items-center gap-1">
          <IconButton
            label="Previous month"
            variant="ghost"
            size="sm"
            onClick={onPrev}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            label="Next month"
            variant="ghost"
            size="sm"
            onClick={onNext}
          >
            <ChevronRight className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS_ID.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]"
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
                "aspect-square rounded-lg p-1.5 text-xs transition-colors",
                "flex flex-col items-center justify-between",
                inMonth
                  ? "text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)]/60",
                isSelected
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "hover:bg-[var(--color-card-subtle)]",
              ].join(" ")}
            >
              <span
                className={[
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isToday && !isSelected
                    ? "bg-[var(--color-text-primary)] text-white"
                    : "",
                ].join(" ")}
              >
                {d.getDate()}
              </span>

              {day && (
                <span className="flex items-center gap-0.5" aria-hidden>
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
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
