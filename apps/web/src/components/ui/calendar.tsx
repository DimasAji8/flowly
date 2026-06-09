"use client"

import * as React from "react"
import { DayPicker, getDefaultClassNames, type DayButton, type Locale } from "react-day-picker"
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale,
  formatters,
  components,
  month: controlledMonth,
  onMonthChange,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const defaultClassNames = getDefaultClassNames()
  const [internalMonth, setInternalMonth] = React.useState<Date>(controlledMonth || new Date())
  
  const currentMonth = controlledMonth || internalMonth
  
  const handleMonthChange = (newMonth: Date) => {
    if (onMonthChange) {
      onMonthChange(newMonth)
    } else {
      setInternalMonth(newMonth)
    }
  }

  const navBtnCls = "inline-flex size-[var(--cell-size)] items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors select-none aria-disabled:opacity-50"

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-background p-3 [--cell-size:1.75rem]",
        className
      )}
      month={currentMonth}
      onMonthChange={handleMonthChange}
      locale={locale}
      formatters={formatters}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn("absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1 pointer-events-none", defaultClassNames.nav),
        button_previous: cn(navBtnCls, "pointer-events-auto", defaultClassNames.button_previous),
        button_next: cn(navBtnCls, "pointer-events-auto", defaultClassNames.button_next),
        month_caption: cn("flex h-[var(--cell-size)] w-full items-center justify-center px-[var(--cell-size)] relative z-10", defaultClassNames.month_caption),
        caption_label: cn("text-sm font-medium select-none", defaultClassNames.caption_label),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn("flex-1 rounded-md text-[0.8rem] font-normal text-muted-foreground select-none", defaultClassNames.weekday),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        day: cn("group/day relative aspect-square h-full w-full rounded-md p-0 text-center select-none", defaultClassNames.day),
        today: cn("rounded-md bg-muted text-foreground", defaultClassNames.today),
        outside: cn("text-muted-foreground aria-selected:text-muted-foreground", defaultClassNames.outside),
        disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        ),
        MonthCaption: ({ ...captionProps }) => (
          <CustomMonthCaption {...captionProps} currentMonth={currentMonth} onMonthChange={handleMonthChange} />
        ),
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          if (orientation === "right") return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },
        DayButton: ({ ...props }) => <CalendarDayButton locale={locale} {...props} />,
        ...components,
      }}
      {...props}
    />
  )
}

function CustomMonthCaption({ 
  currentMonth, 
  onMonthChange 
}: { 
  currentMonth: Date
  onMonthChange: (date: Date) => void
}) {
  const [monthOpen, setMonthOpen] = React.useState(false)
  const [yearOpen, setYearOpen] = React.useState(false)
  const yearContentRef = React.useRef<HTMLDivElement>(null)

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 201 }, (_, i) => currentYear - 100 + i)

  const currentMonthIndex = currentMonth.getMonth()
  const currentYearValue = currentMonth.getFullYear()

  // Scroll agar tahun yang dipilih muncul di tengah dropdown
  React.useEffect(() => {
    if (!yearOpen) return
    const scrollToSelected = () => {
      const container = yearContentRef.current
      if (!container) return
      const selected = container.querySelector<HTMLElement>(
        `[data-year="${currentYearValue}"]`,
      )
      if (!selected) return
      // Hitung posisi relatif item terhadap container, lalu center-kan
      const top =
        selected.offsetTop -
        container.clientHeight / 2 +
        selected.offsetHeight / 2
      container.scrollTop = Math.max(0, top)
    }
    // Tunggu dropdown content ter-mount & ter-ukur sebelum scroll
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(scrollToSelected),
    )
    return () => cancelAnimationFrame(raf)
  }, [yearOpen, currentYearValue])

  const handleMonthChangeInternal = (newMonthIndex: number) => {
    const newDate = new Date(currentMonth)
    newDate.setMonth(newMonthIndex)
    onMonthChange(newDate)
    setMonthOpen(false)
  }

  const handleYearChangeInternal = (newYear: number) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(newYear)
    onMonthChange(newDate)
    setYearOpen(false)
  }

  return (
    <div className="flex h-[var(--cell-size)] w-full items-center justify-center gap-2 px-[var(--cell-size)]">
      <DropdownMenu open={monthOpen} onOpenChange={setMonthOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-card-subtle px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent transition-colors"
          >
            <span>{months[currentMonthIndex]}</span>
            <ChevronDownIcon className="size-3.5 text-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
          {months.map((monthName, index) => (
            <DropdownMenuItem
              key={monthName}
              onSelect={() => handleMonthChangeInternal(index)}
            >
              {monthName}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={yearOpen} onOpenChange={setYearOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-card-subtle px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent transition-colors"
          >
            <span>{currentYearValue}</span>
            <ChevronDownIcon className="size-3.5 text-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent ref={yearContentRef} align="start" className="max-h-[300px] overflow-y-auto">
          {years.map((year) => (
            <DropdownMenuItem
              key={year}
              data-year={year}
              onSelect={() => handleYearChangeInternal(year)}
            >
              {year}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) items-center justify-center rounded-md border-0 text-sm font-normal leading-none transition-colors",
        "hover:bg-accent hover:text-foreground",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar }
