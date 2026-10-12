import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Providers } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";
export const metadata: Metadata = { title: "Hệ thống Quản lý Hồ sơ Đo đạc", description: "Không gian quản lý hồ sơ đo đạc và giao việc hàng ngày" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="vi"><body><AntdRegistry><Providers><AppShell>{children}</AppShell></Providers></AntdRegistry></body></html>;
}
