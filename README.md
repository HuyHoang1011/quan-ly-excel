# Hệ thống Quản lý Hồ sơ Đo đạc

Demo giao diện tiếng Việt, chạy cục bộ bằng Next.js 16 / React 19, TypeScript, Tailwind CSS v4 và Ant Design. Dự án giữ cấu trúc App Router sẵn có tại thư mục app/.

## Chạy dự án

Trong thư mục quan-ly-excel, cài các dependency đã khai báo bằng pnpm install, sau đó chạy pnpm dev. Mở http://localhost:3000.

Lần bàn giao này chỉ chỉnh sửa mã nguồn: chưa cài thêm thư viện, chưa chạy dev, build, lint hoặc test. package-lock.json cũ của dự án chưa được tái tạo; pnpm install sẽ tạo pnpm-lock.yaml cho bộ dependency mới.

## Các trang

- / — thống kê từ dữ liệu đang lưu, 7 hồ sơ cập nhật gần nhất và nội dung giao việc hôm nay.
- /ho-so — AG Grid Community với 25 cột gốc theo demo.xlsx; tìm kiếm không dấu, bộ lọc từng cột, sắp xếp, resize, ghim và ẩn cột, phân trang, chọn/xóa nhiều dòng, thêm dòng trực tiếp, drawer thêm/sửa, import/export Excel.
- /cai-dat — thêm cột tùy chỉnh, đổi tên/thứ tự, lựa chọn dropdown, hiển thị và ghim cột. Cột gốc không thể xóa hoặc đổi kiểu dữ liệu. Cho phép cấu hình các trạng thái dùng để tính thống kê.
- /giao-viec — lịch và lịch sử theo ngày, tìm kiếm nội dung, trình soạn thảo Tiptap, tự lưu sau 800 ms, lưu khi đổi trang/ngày hoặc ẩn tab, xem trước và in A4. Chọn lưu dưới dạng PDF trong hộp thoại in.

## Các tệp chính

- app/layout.tsx, app/globals.css: bộ khung, Ant Design registry và giao diện responsive/print.
- components/layout/app-shell.tsx: sidebar navy, breadcrumb, ngày hiện tại và tài khoản demo.
- components/providers.tsx: context trạng thái và điểm gọi data service; chỉ đọc localStorage sau khi mount.
- components/dashboard/dashboard.tsx: tổng quan.
- components/records/records-page.tsx, record-drawer.tsx, import-modal.tsx: bảng, form cấu hình động và xem trước Excel.
- components/settings/settings-page.tsx: quản lý cấu trúc cột và reset demo.
- components/assignments/assignments-page.tsx, assignment-document.tsx, rich-editor.tsx: lịch, tài liệu và thanh định dạng.
- components/shared/ui.tsx: badge, tiêu đề trang và hiển thị HTML được làm sạch.
- lib/storage/service.ts: giao diện DataService và implementation localStorage, kiểm tra dữ liệu, giữ nguyên bản lưu lỗi khi đọc thất bại.
- lib/seed/data.ts: 25 cột gốc, 24 hồ sơ minh họa tự tạo và nội dung giao việc ngày 12/10/2026.
- lib/excel/workbook.ts: đọc/ghi ExcelJS phía trình duyệt.
- lib/utils/format.ts, types/demo.ts: định dạng và kiểu dữ liệu dùng chung.

## Quy ước dữ liệu

Bốn khóa lưu trữ: land_records_demo_v1, land_record_columns_v1, daily_assignments_demo_v1, demo_settings_v1. Chỉ seed khóa chưa tồn tại; danh sách rỗng vẫn được giữ nguyên khi tải lại. UUID dùng cho hồ sơ/cột tự tạo; SỐ TT chỉ là thứ tự hiển thị, không phải khóa.

Các giá trị hồ sơ nằm trong values, dùng ID cột ổn định. Số thửa, tờ bản đồ, ký hiệu, số điện thoại lưu dưới dạng chuỗi. Ngày lưu YYYY-MM-DD; tiền và diện tích lưu số. Ngày hôm nay dùng múi giờ Việt Nam (UTC+7).

Hồ sơ minh họa được tạo riêng; demo.xlsx được dùng để đối chiếu cấu trúc và cách biểu diễn dữ liệu, không được sao chép tự động vào bộ seed. Người dùng có thể nhập tệp mẫu từ trang Hồ sơ.

Cột tùy chỉnh tự xuất hiện trong bảng và form; cột ẩn vẫn có thể sửa trong form. Thứ tự bảng có thể thay đổi, nhưng xuất Excel luôn đặt 25 cột gốc theo thứ tự và tên gốc trước, rồi đến các cột tự tạo, kể cả cột đang ẩn.

## Import / export Excel

Import tìm dòng tiêu đề khớp tốt nhất trong 30 dòng đầu mỗi trang tính, hỗ trợ tên gốc và tên đã đổi, cảnh báo cột lạ/cột thiếu và giữ giá trị dropdown mới. Các trang tính còn lại không được nhập. Xem trước toàn bộ dữ liệu với phân trang; lỗi ngày/số/checkbox chặn nhập cho đến khi sửa tệp. Thay thế danh sách cần xác nhận. Giới hạn tệp 15 MB, 20.000 dòng.

Ngày hỗ trợ ô Date, số serial Excel (1900/1904), YYYY-MM-DD và DD/MM/YYYY. Tiền/diện tích hỗ trợ chuỗi tiếng Việt như 1.000.000 đ, 10000,0. Số 0 đầu được giữ khi ô là chuỗi hoặc số có định dạng 000…; nếu tệp nguồn đã lưu số và mất số 0, ứng dụng không tự suy đoán số bị thiếu. Công thức chỉ đọc kết quả đã lưu trong Excel, không tính lại công thức.

Export có header in đậm, bộ lọc, cố định dòng đầu, định dạng ngày/số/tiền, tên DanhSachHoSo_YYYY-MM-DD.xlsx. Xuất kết quả đang lọc bao gồm mọi trang phân trang và thứ tự sắp xếp hiện tại.

## Phạm vi lưu trữ

Không có backend, database, API Routes, đăng nhập hoặc phân quyền. Không có yêu cầu mạng bên ngoài từ ứng dụng; font dùng font hệ thống. Dữ liệu thuộc từng trình duyệt/origin, không đồng bộ giữa thiết bị hoặc các tab đang mở. Khi localStorage đầy/bị chặn, thay đổi giữ trong bộ nhớ phiên và hiển thị cảnh báo. Có thể xuất Excel hoặc in nội dung đang mở để giữ dữ liệu.

Tách DataService khỏi UI cho phép thay implementation bằng API ở giai đoạn sau; khi chuyển sang service bất đồng bộ cần điều chỉnh lớp provider tương ứng.
