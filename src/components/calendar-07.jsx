import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function Calendar07() {
  const [dateRange, setDateRange] = React.useState({
    from: new Date(2025, 5, 18),
    to: new Date(2025, 6, 7),
  })

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Calendar
        mode="range"
        defaultMonth={dateRange?.from}
        selected={dateRange}
        onSelect={setDateRange}
        numberOfMonths={2}
        min={2}
        max={20}
        className="rounded-lg border shadow-sm" />
      <div className="text-muted-foreground text-center text-xs">
        Your stay must be between 2 and 20 nights
      </div>
    </div>
  );
}
