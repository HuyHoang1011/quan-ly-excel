export type FieldType = "text" | "number" | "date" | "select" | "checkbox" | "currency";
export type CellValue = string | number | boolean | null;
export interface RecordColumn {
  id: string; label: string; type: FieldType; group: string;
  originalLabel?: string; originalOrder?: number;
  visible: boolean; pinned?: "left" | "right"; width?: number; options?: string[];
}
export interface LandRecord { id: string; values: Record<string, CellValue>; createdAt: string; updatedAt: string }
export interface DailyAssignment { id: string; date: string; title: string; content: string; createdAt: string; updatedAt: string }
export interface DemoSettings { completedStatuses: string[]; paidStatuses: string[] }
export interface DemoData { records: LandRecord[]; columns: RecordColumn[]; assignments: DailyAssignment[]; settings: DemoSettings }
