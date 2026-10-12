"use client";
import { useState } from "react";
import { Alert, App, Button, Modal, Radio, Table, Upload } from "antd";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useDemo } from "@/components/providers";
import { readWorkbook, type ImportPreview } from "@/lib/excel/workbook";
import { displayValue } from "@/lib/utils/format";
export function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, update } = useDemo(); const { message, modal } = App.useApp();
  const [preview, setPreview] = useState<ImportPreview | null>(null); const [busy, setBusy] = useState(false); const [mode, setMode] = useState("append"); const [filename, setFilename] = useState("");
  async function load(file: File) { setBusy(true); setPreview(null); setFilename(file.name); try { setPreview(await readWorkbook(file, data.columns)); } catch (error) { void message.error(`Không thể nhập tệp: ${(error as Error).message}`); } finally { setBusy(false); } }
  function commit() {
    if (!preview || preview.errors.length) return;
    const saved = update("records", rows => mode === "replace" ? preview.records : [...preview.records, ...rows]);
    update("columns", columns => columns.map(c => c.type !== "select" ? c : { ...c, options: [...new Set([...(c.options || []), ...preview.records.map(r => r.values[c.id]).filter((v): v is string => typeof v === "string" && !!v)])] }));
    if (saved) void message.success(`Đã nhập ${preview.records.length} hồ sơ`); onClose();
  }
  function submit() { if (mode === "replace") modal.confirm({ title: "Thay thế toàn bộ hồ sơ?", content: `${data.records.length} hồ sơ hiện tại sẽ được thay bằng ${preview?.records.length ?? 0} hồ sơ trong tệp. Nên xuất Excel trước nếu cần giữ dữ liệu hiện tại.`, okText: "Thay thế dữ liệu", okButtonProps: { danger: true }, cancelText: "Hủy", onOk: commit }); else commit(); }
  return <Modal open={open} width={1040} title="Nhập hồ sơ từ Excel" onCancel={busy ? undefined : onClose} maskClosable={!busy} closable={!busy} footer={<><Button onClick={onClose} disabled={busy}>Đóng</Button><Button type="primary" onClick={submit} disabled={!preview || !!preview.errors.length || busy}>Nhập {preview?.records.length ?? 0} hồ sơ</Button></>}><Upload.Dragger accept=".xlsx" showUploadList={false} disabled={busy} beforeUpload={file => { void load(file); return false; }}><UploadCloud size={32} className="upload-icon" /><p>{busy ? "Đang đọc tệp…" : "Nhấn để chọn hoặc kéo thả tệp Excel vào đây"}</p><p className="muted">Tệp .xlsx · Tối đa 15 MB · Đối chiếu theo tên cột</p></Upload.Dragger>{preview && <><div className="import-summary"><FileSpreadsheet size={19} /><strong>{filename}</strong><span>{preview.sheet} · {preview.records.length} hồ sơ</span></div>{preview.errors.length > 0 && <Alert type="error" showIcon message={`${preview.errors.length} lỗi cần sửa trước khi nhập`} description={<div className="import-messages">{preview.errors.map((e, i) => <div key={i}>{e}</div>)}</div>} />}{preview.warnings.length > 0 && <Alert type="warning" showIcon message="Lưu ý đối chiếu dữ liệu" description={<div className="import-messages">{preview.warnings.map((w, i) => <div key={i}>{w}</div>)}</div>} />}<div className="import-mode"><Radio.Group value={mode} onChange={e => setMode(e.target.value)} options={[{ value: "append", label: "Thêm vào danh sách hiện tại" }, { value: "replace", label: "Thay thế toàn bộ dữ liệu" }]} /></div><Table size="small" rowKey="id" dataSource={preview.records} pagination={{ pageSize: 5, showSizeChanger: false }} scroll={{ x: "max-content" }} columns={data.columns.filter(c => c.id !== "stt").map(c => ({ key: c.id, title: c.label, width: 160, render: (_, r) => displayValue(r.values[c.id], c) }))} /></>}</Modal>;
}
