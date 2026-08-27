"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

function dateToParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function paramToDate(value: string | null) {
  return value ? new Date(`${value}T12:00:00`) : undefined;
}

function formatRange(range: DateRange | undefined) {
  if (!range?.from) return "";

  const fullDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (!range.to || range.from.toDateString() === range.to.toDateString()) {
    return fullDate.format(range.from);
  }

  const sameYear = range.from.getFullYear() === range.to.getFullYear();
  const sameMonth = sameYear && range.from.getMonth() === range.to.getMonth();

  if (sameMonth) {
    return `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(range.from)} to ${range.to.getDate()}, ${range.to.getFullYear()}`;
  }

  if (sameYear) {
    return `${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(range.from)} – ${new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(range.to)}, ${range.to.getFullYear()}`;
  }

  return `${fullDate.format(range.from)} – ${fullDate.format(range.to)}`;
}

export default function CalibrationDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [range, setRange] = useState<DateRange | undefined>({
    from: paramToDate(searchParams.get("calibrationDueFrom")),
    to: paramToDate(searchParams.get("calibrationDueTo")),
  });

  const calibrationDueFrom = searchParams.get("calibrationDueFrom");
  const calibrationDueTo = searchParams.get("calibrationDueTo");

  useEffect(() => {
    setRange({
      from: paramToDate(calibrationDueFrom),
      to: paramToDate(calibrationDueTo),
    });
  }, [calibrationDueFrom, calibrationDueTo]);

  function updateRange(nextRange: DateRange | undefined) {
    if (!nextRange?.from) {
      setRange(undefined);
      return;
    }

    const from = nextRange.from;
    const to = nextRange.to;

    const isFirstClick = !to || from.toDateString() === to.toDateString();

    if (isFirstClick) {
      setRange({
        from,
        to: undefined,
      });
      return;
    }

    setRange({ from, to });

    const params = new URLSearchParams(searchParams.toString());

    params.set("calibrationDueFrom", dateToParam(from));
    params.set("calibrationDueTo", dateToParam(to));

    router.replace(`${pathname}?${params.toString()}`);
  }

  function clearRange() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("calibrationDueFrom");
    params.delete("calibrationDueTo");

    setRange(undefined);
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger
          aria-label="Select calibration date range"
          title="Select calibration date range"
          className="flex w-full items-center justify-center rounded-md border border-input bg-background px-2 py-1.5 text-sm font-normal"
        >
          {range?.from ? (
            <span className="whitespace-nowrap">{formatRange(range)}</span>
          ) : (
            <>
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Select calibration date range</span>
            </>
          )}
          <span className="sr-only">
            {range?.from ? formatRange(range) : "Select calibration date range"}
          </span>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={range}
            onSelect={updateRange}
            numberOfMonths={2}
            min={2}
          />
        </PopoverContent>
      </Popover>

      {range?.from && (
        <button
          type="button"
          onClick={clearRange}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}
