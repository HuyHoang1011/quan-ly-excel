"use client";
import { Button, Result } from "antd";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <Result status="warning" title="Không thể mở nội dung" subTitle="Đã xảy ra lỗi khi hiển thị trang. Bạn có thể thử tải lại nội dung." extra={<Button type="primary" onClick={reset}>Thử lại</Button>} />;
}
