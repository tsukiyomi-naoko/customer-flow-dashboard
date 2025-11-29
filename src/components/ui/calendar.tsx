import * as React from "react";
import { cn } from "@/lib/utils";

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: "single";
  selected: Date;
  onSelect?: (d: Date | undefined) => void;
}

const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function Calendar({ className, selected, onSelect }: CalendarProps) {
  const [month, setMonth] = React.useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1)
  );

  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1).getDay();
  const daysInMonth = new Date(year, m + 1, 0).getDate();

  const weeks: (Date | null)[][] = [];
  let current: (Date | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    current.push(new Date(year, m, d));
    if (current.length === 7) {
      weeks.push(current);
      current = [];
    }
  }
  if (current.length) {
    while (current.length < 7) current.push(null);
    weeks.push(current);
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const changeMonth = (delta: number) => {
    setMonth(new Date(year, m + delta, 1));
  };

  return (
    <div className={cn("p-3 space-y-3", className)}>
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-50"
        >
          ‹
        </button>
        <div className="text-sm font-medium">
          {month.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-50"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
        {dayNames.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-sm">
        {weeks.flat().map((d, i) => {
          if (!d) return <div key={i} />;
          const active = isSameDay(d, selected);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(d)}
              className={cn(
                "h-8 w-8 mx-auto flex items-center justify-center rounded-md text-xs",
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-800 hover:bg-slate-100"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
