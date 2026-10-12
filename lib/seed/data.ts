import type { DemoData, RecordColumn, FieldType } from "@/types/demo";
const fields: [string, string, FieldType, string, string[]?][] = [
  ["stt", "SỐ TT", "number", "Hệ thống"],
  ["caller", "Người gọi", "text", "Thông tin chung"],
  ["commune", "XÃ PHƯỜNG", "text", "Thông tin chung"],
  ["oldCommune", "Xã Cũ", "text", "Thông tin chung"],
  ["owner", "CHỦ SỬ DỤNG", "text", "Thông tin chung"],
  ["certificateName", "Tên Theo GCN QSDĐ", "text", "Thông tin chung"],
  ["parcel", "Số Thửa", "text", "Thông tin thửa đất"],
  ["mapSheet", "Tờ Bản Đồ", "text", "Thông tin thửa đất"],
  ["mapType", "Loại BĐ", "text", "Thông tin thửa đất"],
  ["area", "Diện Tích", "number", "Thông tin thửa đất"],
  ["symbol", "Ký Hiệu", "text", "Thông tin thửa đất"],
  ["recordType", "Loại Hồ Sơ", "text", "Thông tin thửa đất"],
  ["status", "Trạng thái", "select", "Tiến độ", ["Chờ xử lý", "Đang đo đạc", "Đang hoàn thiện", "Đã hoàn thành"]],
  ["surveyor", "Người Đo", "text", "Tiến độ"],
  ["startDate", "Ngày bắt đầu đo", "date", "Tiến độ"],
  ["finishDate", "Ngày Hoàn Thành", "date", "Tiến độ"],
  ["amount", "Số Tiền", "currency", "Tài chính"],
  ["appraisal", "Giá Thẩm Định", "currency", "Tài chính"],
  ["paymentStatus", "Tình trạng thu tiền", "select", "Tài chính", ["Chưa thu", "Thu một phần", "Đã thu đủ"]],
  ["collector", "Người Thu Tiền", "text", "Tài chính"],
  ["handoverDate", "Ngày bàn giao tiền", "date", "Tài chính"],
  ["handedOver", "Đã Bàn Giao Tiền", "checkbox", "Tài chính"],
  ["phone", "Số Điện Thoại", "text", "Thông tin chung"],
  ["notes", "Ghi chú", "text", "Bổ sung"],
  ["invoice", "Xuất HĐ", "checkbox", "Bổ sung"],
];
export const originalColumns: RecordColumn[] = fields.map(([id, label, type, group, options], i) => ({ id, label, originalLabel: label, originalOrder: i, type, group, options, visible: true, pinned: i === 0 ? "left" : undefined, width: id === "stt" ? 82 : ["owner", "certificateName"].includes(id) ? 205 : 165 }));
export const assignmentContent = `<h2>1. Anh Nam — Bộ phận đo đạc</h2><ul><li>Đo đạc thửa đất số 123, tờ bản đồ 45.</li><li>Hoàn thiện bản vẽ hồ sơ.</li><li>Liên hệ khách hàng để xác nhận ranh giới.</li></ul><h2>2. Chị Lan — Hành chính</h2><ul><li>Kiểm tra hồ sơ đang chờ xử lý.</li><li>Liên hệ khách hàng bổ sung giấy tờ.</li><li>Cập nhật thông tin hồ sơ.</li></ul><h2>3. Công việc chung</h2><ul><li>Tổng hợp công việc cuối ngày.</li><li>Kiểm tra các hồ sơ chưa hoàn thành.</li></ul>`;
export function createSeed(): DemoData {
  const names = ["Nguyễn Văn An", "Trần Thị Hương", "Lê Văn Minh", "Phạm Thị Mai", "Hoàng Văn Bình", "Đỗ Thị Hoa", "Vũ Đức Thành", "Bùi Thị Lan", "Đinh Văn Nam", "Nguyễn Thị Hà", "Trần Quốc Tuấn", "Lê Thị Hạnh", "Phạm Văn Hùng", "Vũ Thị Thu", "Hoàng Đức Long", "Đỗ Văn Sơn", "Bùi Thị Ngọc", "Đinh Đức Hải", "Nguyễn Văn Phúc", "Trần Thị Yến", "Lê Đức Thắng", "Phạm Thị Thảo", "Vũ Văn Quân", "Hoàng Thị Liên"];
  const records = names.map((name, i) => {
    const date = `2026-10-${String(12 - i % 10).padStart(2, "0")}`;
    return { id: `demo-record-${i + 1}`, createdAt: `${date}T08:00:00+07:00`, updatedAt: `${date}T09:30:00+07:00`, values: {
      caller: name, commune: ["Nho Quan", "Gia Viễn", "Hoa Lư", "Tam Điệp"][i % 4], oldCommune: ["Văn Phong", "Gia Thịnh", "Ninh Mỹ", "Yên Bình"][i % 4], owner: name, certificateName: name,
      parcel: i === 0 ? "00123" : String(124 + i * 7), mapSheet: String(45 + i % 8).padStart(3, "0"), mapType: "Địa chính", area: 125 + i * 32.5, symbol: ["ONT", "ODT", "CLN"][i % 3], recordType: ["Trích đo địa chính", "Cắm mốc", "Tách thửa", "Cấp đổi GCN"][i % 4],
      status: ["Đang đo đạc", "Đã hoàn thành", "Chờ xử lý", "Đang hoàn thiện"][i % 4], surveyor: ["Anh Nam", "Anh Thắng", "Anh Minh"][i % 3], startDate: date, finishDate: i % 4 === 1 ? "2026-10-12" : "",
      amount: 1500000 + (i % 6) * 500000, appraisal: 200000 + (i % 3) * 100000, paymentStatus: ["Chưa thu", "Đã thu đủ", "Thu một phần"][i % 3], collector: i % 3 === 1 ? "Chị Lan" : "", handoverDate: i % 3 === 1 ? "2026-10-12" : "", handedOver: i % 3 === 1, phone: `090000${String(1000 + i)}`, notes: i % 4 === 2 ? "Chờ bổ sung bản sao giấy chứng nhận" : i % 4 === 1 ? "Đã gửi hồ sơ cho khách hàng" : "Hẹn khách hàng xác nhận ranh giới", invoice: i % 3 === 1,
    } };
  });
  return { records, columns: structuredClone(originalColumns), assignments: [{ id: "demo-assignment-2026-10-12", date: "2026-10-12", title: "CÔNG VIỆC NGÀY 12/10/2026", content: assignmentContent, createdAt: "2026-10-12T08:00:00+07:00", updatedAt: "2026-10-12T08:00:00+07:00" }], settings: { completedStatuses: ["Đã hoàn thành"], paidStatuses: ["Đã thu đủ"] } };
}
