import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

/**
 * Props
 * - value:  { from: Date|null, to: Date|null }
 * - onChange: (range) => void
 */
export default function Calendar05({ value, onChange }) {
  return (
    <Calendar
      mode="range"
      selected={value}
      onSelect={onChange}
      defaultMonth={value?.from ?? new Date()}
      numberOfMonths={2}
      className="rounded-lg border shadow-sm"
    />
  );
}