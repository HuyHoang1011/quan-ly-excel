"use client";
import { useEffect, useMemo } from "react";
import { App, Button, Checkbox, DatePicker, Drawer, Form, Input, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { Save } from "lucide-react";
import { useDemo } from "@/components/providers";
import type { CellValue, LandRecord, RecordColumn } from "@/types/demo";
import { numberVN, parseNumber } from "@/lib/utils/format";
function fieldInput(column: RecordColumn) {
  if (column.type === "date") return <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Chọn ngày" />;
  if (column.type === "select") return <Select allowClear showSearch options={column.options?.map(value => ({ value, label: value }))} placeholder="Chọn giá trị" />;
  if (column.type === "checkbox") return <Checkbox>Đã thực hiện</Checkbox>;
  if (["number", "currency"].includes(column.type)) return <InputNumber style={{ width: "100%" }} min={0} decimalSeparator="," formatter={(value, info) => info.userTyping ? info.input : value === undefined || value === null ? "" : numberVN(Number(value))} parser={value => parseNumber(value) ?? 0} addonAfter={column.type === "currency" ? "₫" : column.id === "area" ? "m²" : undefined} />;
  if (column.id === "notes") return <Input.TextArea rows={3} placeholder="Nhập ghi chú cho hồ sơ…" />;
  return <Input placeholder={`Nhập ${column.label.toLowerCase()}`} />;
}
export function RecordDrawer({ open, record, onClose }: { open: boolean; record: LandRecord | null; onClose: () => void }) {
  const { data, update } = useDemo(); const { message, modal } = App.useApp(); const [form] = Form.useForm();
  const fields = useMemo(() => data.columns.filter(c => c.id !== "stt"), [data.columns]); const groups = [...new Set(fields.map(c => c.group))];
  useEffect(() => { if (open) { form.resetFields(); form.setFieldsValue(Object.fromEntries(fields.map(c => [c.id, c.type === "date" && record?.values[c.id] ? dayjs(String(record.values[c.id])) : record?.values[c.id] ?? (c.type === "checkbox" ? false : undefined)]))); } }, [open, record, form, fields]);
  function close() { if (form.isFieldsTouched()) modal.confirm({ title: "Đóng form chưa lưu?", content: "Các thay đổi trong form sẽ bị bỏ qua.", okText: "Đóng form", cancelText: "Tiếp tục nhập", onOk: onClose }); else onClose(); }
  async function save() {
    try {
      const raw = await form.validateFields(); const values: Record<string, CellValue> = { ...record?.values };
      fields.forEach(c => { values[c.id] = c.type === "date" ? raw[c.id]?.format("YYYY-MM-DD") ?? null : raw[c.id] ?? null; });
      const stamp = new Date().toISOString(); const next: LandRecord = { id: record?.id ?? crypto.randomUUID(), values, createdAt: record?.createdAt ?? stamp, updatedAt: stamp };
      const saved = update("records", rows => record ? rows.map(r => r.id === record.id ? next : r) : [next, ...rows]);
      if (saved) void message.success(record ? "Đã cập nhật hồ sơ" : "Đã thêm hồ sơ mới"); onClose();
    } catch { /* Form displays field validation messages. */ }
  }
  return <Drawer title={record ? "Chỉnh sửa hồ sơ" : "Thêm hồ sơ mới"} width={740} open={open} onClose={close} extra={<Button type="primary" onClick={save} icon={<Save size={16} />}>Lưu hồ sơ</Button>}><p className="form-intro">Thông tin hồ sơ được đồng bộ ngay với danh sách của bạn.</p><Form form={form} layout="vertical">{groups.map((group, index) => <section className="form-section" key={group}><h3><span>{String(index + 1).padStart(2, "0")}</span>{group}</h3><div className="form-grid">{fields.filter(c => c.group === group).map(c => <Form.Item key={c.id} name={c.id} label={c.label} valuePropName={c.type === "checkbox" ? "checked" : "value"} className={c.id === "notes" ? "full-width" : ""} rules={c.id === "owner" ? [{ required: true, whitespace: true, message: "Vui lòng nhập chủ sử dụng" }] : []}>{fieldInput(c.type === "select" && record?.values[c.id] ? { ...c, options: [...new Set([...(c.options || []), String(record.values[c.id])])] } : c)}</Form.Item>)}</div></section>)}</Form><div className="drawer-footer"><Button onClick={close}>Hủy</Button><Button type="primary" onClick={save}>Lưu hồ sơ</Button></div></Drawer>;
}
