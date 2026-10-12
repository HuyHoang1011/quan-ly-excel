import type { DemoData } from "@/types/demo";
import { createSeed, originalColumns } from "@/lib/seed/data";
const keys = { records: "land_records_demo_v1", columns: "land_record_columns_v1", assignments: "daily_assignments_demo_v1", settings: "demo_settings_v1" } as const;
export interface DataService { load(): { data: DemoData; warning: string }; save<K extends keyof DemoData>(key: K, value: DemoData[K]): void; reset(): DemoData }
function valid(key: keyof DemoData, value: unknown): boolean {
  if (key === "settings") { const s = value as DemoData["settings"]; return !!s && Array.isArray(s.completedStatuses) && s.completedStatuses.every(x => typeof x === "string") && Array.isArray(s.paidStatuses) && s.paidStatuses.every(x => typeof x === "string"); }
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every(item => {
    if (!item || typeof item.id !== "string" || ids.has(item.id)) return false;
    ids.add(item.id);
    if (key === "columns") return typeof item.label === "string" && ["text", "number", "currency", "date", "select", "checkbox"].includes(item.type) && typeof item.group === "string" && (!item.options || (Array.isArray(item.options) && item.options.every((x: unknown) => typeof x === "string")));
    if (key === "assignments") return [item.date, item.title, item.content, item.updatedAt, item.createdAt].every(x => typeof x === "string");
    return !!item.values && typeof item.values === "object" && !Array.isArray(item.values) && Object.values(item.values).every(v => v === null || ["string", "number", "boolean"].includes(typeof v)) && typeof item.updatedAt === "string";
  });
}
export const dataService: DataService = {
  load() {
    const data = createSeed(); const warnings: string[] = [];
    for (const key of Object.keys(keys) as (keyof DemoData)[]) {
      try {
        const raw = window.localStorage.getItem(keys[key]);
        if (raw === null) { this.save(key, data[key]); continue; }
        const parsed: unknown = JSON.parse(raw);
        if (!valid(key, parsed)) throw new Error("Dữ liệu không hợp lệ");
        Object.assign(data, { [key]: parsed });
      } catch { warnings.push("Không đọc được một phần dữ liệu lưu. Bản demo đang dùng dữ liệu tạm; bản lưu lỗi chưa bị ghi đè."); }
    }
    data.columns = data.columns.map(c => { const base = originalColumns.find(b => b.id === c.id); return base ? { ...c, originalLabel: base.originalLabel, originalOrder: base.originalOrder, type: base.type, group: base.group } : c; });
    for (const c of originalColumns) if (!data.columns.some(item => item.id === c.id)) data.columns.push(structuredClone(c));
    return { data, warning: [...new Set(warnings)].join(" ") };
  },
  save(key, value) {
    try { window.localStorage.setItem(keys[key], JSON.stringify(value)); }
    catch { throw new Error("Không thể lưu trên trình duyệt (bộ nhớ đầy hoặc bị chặn). Thay đổi vẫn còn trong phiên này; hãy xuất Excel để giữ hồ sơ."); }
  },
  reset() { const data = createSeed(); for (const key of Object.keys(keys) as (keyof DemoData)[]) this.save(key, data[key]); return data; },
};
