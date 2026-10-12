"use client";
import { Tag } from "antd";
import DOMPurify from "dompurify";
import { normalize } from "@/lib/utils/format";
export function StatusBadge({ value }: { value: unknown }) {
  const text = String(value || "Chưa cập nhật"); const clean = normalize(text);
  const color = clean.includes("hoan thanh") || clean.includes("da thu") ? "green" : clean.includes("dang") ? "blue" : clean.includes("mot phan") ? "purple" : "orange";
  return <Tag color={color} bordered={false} className="status-badge"><span className="badge-dot" />{text}</Tag>;
}
export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div><div className="heading-actions">{actions}</div></div>; }
export function RichPreview({ html, className = "" }: { html: string; className?: string }) {
  const safe = typeof window === "undefined" ? "" : DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ["img", "video", "audio", "iframe", "style"], FORBID_ATTR: ["src", "srcset"] });
  return <div className={`rich-content ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />;
}
