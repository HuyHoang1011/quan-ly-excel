"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { App, ConfigProvider, Spin } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import type { DemoData } from "@/types/demo";
import { dataService } from "@/lib/storage/service";
dayjs.locale("vi");
type DemoContextValue = { data: DemoData; warning: string; update: <K extends keyof DemoData>(key: K, value: DemoData[K] | ((previous: DemoData[K]) => DemoData[K])) => boolean; reset: () => void };
const DemoContext = createContext<DemoContextValue | null>(null);
function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DemoData | null>(null); const current = useRef<DemoData | null>(null);
  const [warning, setWarning] = useState(""); const { message } = App.useApp();
  useEffect(() => { const loaded = dataService.load(); current.current = loaded.data; setData(loaded.data); setWarning(loaded.warning); }, []);
  const update = useCallback(<K extends keyof DemoData,>(key: K, value: DemoData[K] | ((previous: DemoData[K]) => DemoData[K])) => {
    if (!current.current) return false;
    const next = typeof value === "function" ? value(current.current[key]) : value;
    current.current = { ...current.current, [key]: next }; setData(current.current);
    try { dataService.save(key, next); return true; }
    catch (error) { const text = (error as Error).message; setWarning(text); void message.error({ content: text, key: "storage" }); return false; }
  }, [message]);
  function reset() { try { const next = dataService.reset(); current.current = next; setData(next); setWarning(""); void message.success("Đã khôi phục dữ liệu demo"); } catch (error) { setWarning((error as Error).message); void message.error((error as Error).message); } }
  if (!data) return <div className="initial-loading"><Spin size="large" /><p>Đang mở không gian làm việc…</p></div>;
  return <DemoContext.Provider value={{ data, warning, update, reset }}>{children}</DemoContext.Provider>;
}
export function Providers({ children }: { children: React.ReactNode }) {
  return <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: "#2563eb", colorText: "#23324b", borderRadius: 8, fontFamily: "Arial, Helvetica, sans-serif", controlHeight: 38 }, components: { Button: { primaryShadow: "0 3px 8px #2563eb22" }, Table: { headerBg: "#f7f9fc" } } }}><App><DataProvider>{children}</DataProvider></App></ConfigProvider>;
}
export function useDemo() { const context = useContext(DemoContext); if (!context) throw new Error("Thiếu DataProvider"); return context; }
