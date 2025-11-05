import { format, parseISO } from "date-fns";

export const parseYMD = (str) => (str ? parseISO(str) : undefined);
export const toYMD = (d) => format(d, "yyyy-MM-dd");   
