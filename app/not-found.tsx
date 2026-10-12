import Link from "next/link";
export default function NotFound() { return <section className="panel" style={{ padding: 48, textAlign: "center" }}><h1>Không tìm thấy trang</h1><p style={{ margin: "18px 0" }}>Trang bạn yêu cầu không có trong hệ thống.</p><Link href="/" style={{ color: "#2563eb" }}>Trở về tổng quan</Link></section>; }
