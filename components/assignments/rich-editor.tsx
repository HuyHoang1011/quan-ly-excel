"use client";
import { useState } from "react";
import { Button, Input, Modal, Select, Tooltip } from "antd";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Undo2, Redo2, Link2, Unlink } from "lucide-react";
export function RichEditor({ content, onChange }: { content: string; onChange: (html: string) => void }) {
  const [linkOpen, setLinkOpen] = useState(false); const [url, setUrl] = useState(""); const [error, setError] = useState("");
  const editor = useEditor({ extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: { openOnClick: false, autolink: false } }), TextAlign.configure({ types: ["heading", "paragraph"] })], content, immediatelyRender: false, editorProps: { attributes: { class: "rich-content editor-document", "aria-label": "Nội dung giao việc", role: "textbox", "aria-multiline": "true" } }, onUpdate: ({ editor }) => onChange(editor.getHTML()) });
  useEditorState({ editor, selector: ({ editor }) => ({ bold: editor?.isActive("bold"), italic: editor?.isActive("italic"), underline: editor?.isActive("underline"), heading: editor?.getAttributes("heading").level, align: editor?.getAttributes("paragraph").textAlign, list: editor?.isActive("bulletList"), ordered: editor?.isActive("orderedList"), link: editor?.isActive("link"), undo: editor?.can().undo(), redo: editor?.can().redo() }) });
  if (!editor) return <div className="editor-loading">Đang mở trình soạn thảo…</div>;
  const tools = [
    { title: "In đậm", icon: Bold, active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
    { title: "In nghiêng", icon: Italic, active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
    { title: "Gạch chân", icon: Underline, active: editor.isActive("underline"), action: () => editor.chain().focus().toggleUnderline().run() },
    { title: "Danh sách dấu chấm", icon: List, active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
    { title: "Danh sách đánh số", icon: ListOrdered, active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
    { title: "Căn trái", icon: AlignLeft, active: editor.isActive({ textAlign: "left" }), action: () => editor.chain().focus().setTextAlign("left").run() },
    { title: "Căn giữa", icon: AlignCenter, active: editor.isActive({ textAlign: "center" }), action: () => editor.chain().focus().setTextAlign("center").run() },
    { title: "Căn phải", icon: AlignRight, active: editor.isActive({ textAlign: "right" }), action: () => editor.chain().focus().setTextAlign("right").run() },
  ];
  function applyLink() {
    if (!url.trim()) { editor!.chain().focus().extendMarkRange("link").unsetLink().run(); setLinkOpen(false); return; }
    try { const parsed = new URL(url.trim()); if (!["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol)) throw new Error(); editor!.chain().focus().extendMarkRange("link").setLink({ href: parsed.href, target: "_blank", rel: "noopener noreferrer" }).run(); setLinkOpen(false); } catch { setError("Nhập liên kết http://, https://, mailto: hoặc tel: hợp lệ."); }
  }
  return <div className="rich-editor"><div className="editor-toolbar"><Select aria-label="Kiểu đoạn văn" value={editor.isActive("heading") ? String(editor.getAttributes("heading").level) : "paragraph"} options={[{ value: "paragraph", label: "Văn bản thường" }, { value: "1", label: "Tiêu đề 1" }, { value: "2", label: "Tiêu đề 2" }, { value: "3", label: "Tiêu đề 3" }]} onChange={value => value === "paragraph" ? editor.chain().focus().setParagraph().run() : editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 }).run()} /><span className="toolbar-separator" />{tools.map(t => <Tooltip title={t.title} key={t.title}><Button type={t.active ? "primary" : "text"} aria-label={t.title} aria-pressed={t.active} icon={<t.icon size={16} />} onClick={t.action} /></Tooltip>)}<span className="toolbar-separator" /><Tooltip title="Chèn liên kết"><Button type="text" aria-label="Chèn liên kết" icon={<Link2 size={16} />} onClick={() => { setUrl(editor.getAttributes("link").href || ""); setError(""); setLinkOpen(true); }} /></Tooltip><Button type="text" aria-label="Bỏ liên kết" disabled={!editor.isActive("link")} icon={<Unlink size={16} />} onClick={() => editor.chain().focus().unsetLink().run()} /><Button type="text" aria-label="Hoàn tác" disabled={!editor.can().undo()} icon={<Undo2 size={16} />} onClick={() => editor.chain().focus().undo().run()} /><Button type="text" aria-label="Làm lại" disabled={!editor.can().redo()} icon={<Redo2 size={16} />} onClick={() => editor.chain().focus().redo().run()} /></div><EditorContent editor={editor} /><Modal open={linkOpen} title="Chèn đường liên kết" okText="Áp dụng" cancelText="Hủy" onOk={applyLink} onCancel={() => setLinkOpen(false)}><Input aria-label="Đường liên kết" value={url} placeholder="https://…" onChange={e => { setUrl(e.target.value); setError(""); }} onPressEnter={applyLink} />{error && <p className="error-text">{error}</p>}</Modal></div>;
}
