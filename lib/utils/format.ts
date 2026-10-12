import type { CellValue, RecordColumn } from "@/types/demo";
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const numberVN = (value: number) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(value);
export const moneyVN = (value: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
export function dateVN(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split("-").reverse().join("/") : value; }
export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let text = String(value).trim().replace(/[\s₫đ]/gi, "");
  if (text.includes(",")) text = text.replace(/\./g, "").replace(",", ".");
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(text)) text = text.replace(/\./g, "");
  return /^-?\d+(\.\d+)?$/.test(text) && Number.isFinite(Number(text)) ? Number(text) : null;
}
export function displayValue(value: CellValue | undefined, column: RecordColumn) {
  if (value === null || value === undefined || value === "") return "—";
  if (column.type === "checkbox") return value ? "Có" : "Không";
  if (column.type === "date") return dateVN(String(value));
  if (column.type === "currency" && typeof value === "number") return moneyVN(value);
  if (column.type === "number" && typeof value === "number") return numberVN(value);
  return String(value);
}
export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đÐĐ]/g, "d").toLowerCase().replace(/\s+/g, " ").trim();
