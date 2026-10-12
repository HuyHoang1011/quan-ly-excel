"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { App, Button, Input, Modal, Tag } from "antd";
import { Save, Eye, Printer, Trash2, CheckCheck, Clock3 } from "lucide-react";
import DOMPurify from "dompurify";
import { useDemo } from "@/components/providers";
import { RichEditor } from "./rich-editor";
import { RichPreview } from "@/components/shared/ui";
import { dateVN } from "@/lib/utils/format";
import type { DailyAssignment } from "@/types/demo";
export function AssignmentDocument({ date, initial, onDeleted }: { date: string; initial?: DailyAssignment; onDeleted: () => void }) {
  const { update } = useDemo(); const { message, modal } = App.useApp();
  const [draft, setDraft] = useState<DailyAssignment>(() => initial ? { ...initial, content: DOMPurify.sanitize(initial.content) } : { id: crypto.randomUUID(), date, title: `CÔNG VIỆC NGÀY ${dateVN(date)}`, content: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  const latest = useRef(draft); const dirty = useRef(false); const discarded = useRef(false); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState(initial ? "saved" : "empty"); const [preview, setPreview] = useState(false);
  const persist = useCallback((notify = false, render = true) => {
    if (discarded.current) return;
    if (timer.current) clearTimeout(timer.current);
    if (!dirty.current && !notify) return;
    const value = { ...latest.current, updatedAt: new Date().toISOString() };
    const saved = update("assignments", items => [...items.filter(a => a.date !== date), value].sort((a, b) => b.date.localeCompare(a.date)));
    latest.current = value; dirty.current = !saved;
    if (render) setState(saved ? "saved" : "error");
    if (notify && saved) void message.success("Đã lưu nội dung giao việc");
  }, [date, update, message]);
  const saveRef = useRef(persist); saveRef.current = persist;
  function change(patch: Partial<DailyAssignment>) { latest.current = { ...latest.current, ...patch }; setDraft(latest.current); dirty.current = true; setState("saving"); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => saveRef.current(), 800); }
  useEffect(() => {
    const flush = () => saveRef.current(false, false);
    const beforeUnload = (event: BeforeUnloadEvent) => { flush(); if (dirty.current) { event.preventDefault(); event.returnValue = ""; } };
    const visibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("beforeunload", beforeUnload); document.addEventListener("visibilitychange", visibility);
    return () => { if (timer.current) clearTimeout(timer.current); flush(); window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  function remove() { modal.confirm({ title: `Xóa nội dung ngày ${dateVN(date)}?`, content: "Nội dung giao việc của ngày này sẽ bị xóa.", okText: "Xóa nội dung", cancelText: "Hủy", okButtonProps: { danger: true }, onOk: () => { discarded.current = true; dirty.current = false; if (timer.current) clearTimeout(timer.current); const saved = update("assignments", items => items.filter(a => a.date !== date)); if (saved) void message.success("Đã xóa nội dung"); onDeleted(); } }); }
  function print() { persist(); window.print(); }
  const text = draft.content.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim(); const count = text ? text.split(/\s+/).length : 0;
  const statusText = state === "saving" ? "Đang lưu…" : state === "saved" ? "Đã lưu" : state === "error" ? "Chưa lưu được" : "Nội dung mới";
  return <section className="panel assignment-document"><div className="document-topbar"><div className="document-date"><Clock3 size={15} /> Ngày {dateVN(date)}<Tag bordered={false} color={state === "error" ? "red" : state === "saved" ? "green" : "default"}>{state === "saved" && <CheckCheck size={13} />}{statusText}</Tag></div><div className="inline-actions"><Button type="text" danger aria-label="Xóa nội dung ngày này" icon={<Trash2 size={16} />} onClick={remove} /><Button icon={<Eye size={16} />} onClick={() => setPreview(true)}>Xem trước</Button><Button icon={<Printer size={16} />} onClick={print}>In / PDF</Button><Button type="primary" icon={<Save size={16} />} onClick={() => persist(true)}>Lưu nội dung</Button></div></div><div className="document-title"><span className="eyebrow">NỘI DUNG GIAO VIỆC</span><Input aria-label="Tiêu đề giao việc" variant="borderless" value={draft.title} placeholder="Nhập tiêu đề giao việc…" onChange={e => change({ title: e.target.value })} /><p>Soạn nội dung cho ngày làm việc. Mọi thay đổi được tự động lưu.</p></div><RichEditor content={draft.content} onChange={content => change({ content })} /><div className="document-footer"><span>{count} từ</span><span>Một nội dung cho mỗi ngày · Lưu sau khi ngừng nhập</span></div><Modal title="Xem trước bản in A4" open={preview} onCancel={() => setPreview(false)} width={880} footer={<><Button onClick={() => setPreview(false)}>Đóng</Button><Button type="primary" icon={<Printer size={16} />} onClick={print}>In / Lưu PDF</Button></>}><article className="print-preview"><h1>{draft.title}</h1><p className="print-date">Ngày {dateVN(date)}</p><RichPreview html={draft.content} /></article><p className="muted">Để xuất PDF, chọn “Lưu dưới dạng PDF” trong hộp thoại in của trình duyệt.</p></Modal>{createPortal(<article className="assignment-print"><h1>{draft.title}</h1><p className="print-date">Ngày {dateVN(date)}</p><RichPreview html={draft.content} /></article>, document.body)}</section>;
}
