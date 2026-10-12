import type { Cell, CellValue as ExcelValue } from "exceljs";
import type { CellValue, LandRecord, RecordColumn } from "@/types/demo";
import { normalize, parseNumber, today } from "@/lib/utils/format";
export interface ImportPreview { records: LandRecord[]; warnings: string[]; errors: string[]; sheet: string; headerRow: number }
function rawValue(value: ExcelValue): unknown {
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("result" in value) return rawValue(value.result as ExcelValue);
    if ("richText" in value) return value.richText.map(t => t.text).join("");
    if ("text" in value) return value.text;
    if ("error" in value) throw new Error(`Ô chứa lỗi Excel ${value.error}`);
    if ("formula" in value || "sharedFormula" in value) throw new Error("Công thức chưa có kết quả đã tính; hãy lưu lại tệp bằng Excel");
  }
  return value;
}
function isoDate(value: unknown, date1904: boolean): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 0 || value > 2958465) throw new Error("Số ngày Excel nằm ngoài phạm vi hợp lệ");
    const serial = Math.floor(value);
    if (!date1904 && serial === 60) throw new Error("Ngày 29/02/1900 của Excel không tồn tại");
    const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, serial < 60 ? 31 : 30);
    return new Date(epoch + serial * 86400000).toISOString().slice(0, 10);
  }
  const text = String(value).trim(); const match = text.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})$/);
  const iso = match ? `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}` : text;
  const date = new Date(`${iso}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) throw new Error(`Ngày không hợp lệ: ${text}`);
  return iso;
}
function convert(cell: Cell, column: RecordColumn, date1904: boolean): CellValue {
  const value = rawValue(cell.value);
  if (value === null || value === undefined || value === "") return column.type === "checkbox" ? false : null;
  if (column.type === "number" || column.type === "currency") { const number = parseNumber(value); if (number === null) throw new Error(`Số không hợp lệ: ${String(value)}`); return number; }
  if (column.type === "date") return isoDate(value, date1904);
  if (column.type === "checkbox") {
    const text = normalize(String(value));
    if (["true", "1", "co", "x", "da", "da ban giao", "da ban giao tien", "da xhd", "da xuat", "da xuat hd", "da xuat hoa don"].includes(text)) return true;
    if (["false", "0", "khong", "chua", "chua xhd", "chua xuat hd", "chua ban giao", "chua ban giao tien"].includes(text)) return false;
    throw new Error(`Giá trị có/không chưa rõ: ${String(value)}`);
  }
  if (typeof value === "number" && /^0+$/.test(cell.numFmt || "")) return String(value).padStart(cell.numFmt.length, "0");
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}
export async function readWorkbook(file: File, columns: RecordColumn[]): Promise<ImportPreview> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error("Vui lòng chọn tệp .xlsx.");
  if (file.size > 15 * 1024 * 1024) throw new Error("Tệp quá lớn. Vui lòng chọn tệp dưới 15 MB.");
  const { Workbook } = await import("exceljs"); const workbook = new Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const aliases = new Map<string, RecordColumn>();
  for (const column of columns) { aliases.set(normalize(column.label), column); if (column.originalLabel) aliases.set(normalize(column.originalLabel), column); }
  let best: { sheet: typeof workbook.worksheets[number]; row: number; score: number } | undefined;
  for (const sheet of workbook.worksheets) for (let r = 1; r <= Math.min(sheet.rowCount, 30); r++) {
    let score = 0; sheet.getRow(r).eachCell(cell => { if (aliases.has(normalize(cell.text))) score++; });
    if (score >= 2 && (!best || score > best.score)) best = { sheet, row: r, score };
  }
  if (!best) throw new Error("Không tìm thấy dòng tiêu đề khớp. Cần ít nhất hai cột theo mẫu hồ sơ.");
  const { sheet, row: headerRow } = best; const mapping = new Map<number, RecordColumn>(); const warnings: string[] = []; const errors: string[] = []; const mapped = new Set<string>();
  sheet.getRow(headerRow).eachCell((cell, index) => {
    const field = aliases.get(normalize(cell.text));
    if (!field) warnings.push(`Bỏ qua cột không khớp: ${cell.text}`);
    else if (mapped.has(field.id)) errors.push(`Trùng tiêu đề cột: ${cell.text}`);
    else { mapping.set(index, field); mapped.add(field.id); }
  });
  const missing = columns.filter(c => c.originalLabel && c.id !== "stt" && !mapped.has(c.id));
  if (missing.length) warnings.push(`Các cột thiếu sẽ để trống: ${missing.map(c => c.label).join(", ")}`);
  if (workbook.worksheets.length > 1) warnings.push(`Đang nhập trang tính “${sheet.name}”. Các trang khác không được nhập.`);
  if (sheet.rowCount > 20001) throw new Error("Vui lòng chia tệp thành các phần không quá 20.000 dòng.");
  const records: LandRecord[] = []; const stamp = new Date().toISOString();
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const values: Record<string, CellValue> = {}; let nonEmpty = false;
    for (const [index, field] of mapping) {
      if (field.id === "stt") continue;
      const cell = sheet.getRow(r).getCell(index);
      if (cell.value !== null && cell.text !== "") nonEmpty = true;
      try {
        let value = convert(cell, field, !!workbook.properties.date1904);
        if (field.type === "select" && typeof value === "string" && value) {
          const known = field.options?.find(o => normalize(o) === normalize(value as string));
          if (known) value = known;
          else warnings.push(`Dòng ${r}, ${field.label}: giữ lựa chọn mới “${value}”.`);
        }
        values[field.id] = value;
      } catch (error) { errors.push(`Dòng ${r}, ${field.label}: ${(error as Error).message}`); }
    }
    if (nonEmpty) records.push({ id: crypto.randomUUID(), values, createdAt: stamp, updatedAt: stamp });
  }
  if (!records.length) errors.push("Không có dòng dữ liệu để nhập.");
  return { records, warnings: [...new Set(warnings)], errors, sheet: sheet.name, headerRow };
}
export async function exportWorkbook(records: LandRecord[], columns: RecordColumn[]) {
  const { Workbook } = await import("exceljs"); const book = new Workbook(); const sheet = book.addWorksheet("Danh sách hồ sơ");
  const ordered = [...columns.filter(c => c.originalOrder !== undefined).sort((a, b) => a.originalOrder! - b.originalOrder!), ...columns.filter(c => c.originalOrder === undefined)];
  sheet.columns = ordered.map(c => ({ header: c.originalLabel || c.label, key: c.id, width: c.id === "stt" ? 9 : Math.max(18, Math.min(32, c.label.length + 7)) }));
  records.forEach((record, index) => {
    const row = sheet.addRow(ordered.map(c => {
      if (c.id === "stt") return index + 1;
      const value = record.values[c.id];
      if (value === undefined || value === null || value === "") return null;
      if (c.type === "date") return new Date(`${value}T00:00:00Z`);
      if (c.type === "checkbox") return value ? "Có" : "Không";
      return value;
    }));
    row.height = 24;
    ordered.forEach((c, i) => { row.getCell(i + 1).numFmt = c.type === "date" ? "dd/mm/yyyy" : c.type === "currency" ? '#,##0 "đ"' : c.type === "number" ? "#,##0.###" : "@"; });
  });
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }; sheet.getRow(1).height = 34;
  sheet.getRow(1).eachCell(c => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF193452" } }; c.alignment = { vertical: "middle", wrapText: true }; });
  sheet.views = [{ state: "frozen", ySplit: 1, xSplit: 1 }]; sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, records.length + 1), column: ordered.length } };
  const buffer = await book.xlsx.writeBuffer(); const bytes = new Uint8Array(buffer);
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a"); a.href = url; a.download = `DanhSachHoSo_${today()}.xlsx`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}
