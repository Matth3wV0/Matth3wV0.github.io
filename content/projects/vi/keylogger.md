---
id: keylogger
title: "Keylogger Snake Game"
description: "Phòng thí nghiệm phân tích malware proof-of-concept mô phỏng vòng đời tấn công hoàn chỉnh: phishing, thu thập thông tin đăng nhập, persistence và exfiltration C2 qua Telegram."
category: malware
icon: skull
color: red
tags:
  - "MITRE ATT&CK"
  - "Python"
  - "Credential Theft"
  - "C2"
stats:
  - value: "5"
    label: "Kỹ thuật ATT&CK"
  - value: "Full"
    label: "Kill Chain"
hasModal: true
span: 2
video: "https://youtu.be/7qFA9ravRq4"
order: 4
---

## 📋 Tóm tắt

Dự án này là phòng thí nghiệm phân tích malware được kiểm soát, thiết kế để mô phỏng vòng đời hoàn chỉnh của trojan đánh cắp thông tin. Bằng cách nhúng keylogger vào game Snake có vẻ vô hại, nó minh họa cách kẻ tấn công vũ khí hóa ứng dụng hợp pháp để tránh phát hiện.

## 🎯 Kịch bản tấn công

Nạn nhân nhận email phishing chứa file đính kèm 'Snake Game'. Khi thực thi, game bị trojan hóa hoạt động bình thường trong khi âm thầm triển khai các module thu thập thông tin đăng nhập và persistence ở nền.

## 🔴 MITRE ATT&CK Mapping

| Chiến thuật | Kỹ thuật | Triển khai |
|-------------|----------|------------|
| Initial Access | T1566.001 Phishing: Spear-phishing Attachment | Game độc hại phân phối qua email |
| Execution | T1204.002 User Execution: Malicious File | Nạn nhân khởi chạy game Snake bị trojan hóa |
| Persistence | T1547.001 Boot or Logon Autostart: Registry Run Keys | Script thêm vào thư mục Startup Windows |
| Credential Access | T1056.001 Input Capture: Keylogging | Thư viện pynput bắt tất cả phím bấm |
| Credential Access | T1555.003 Credentials from Password Stores: Browsers | Giải mã cơ sở dữ liệu SQLite Chrome qua AES |
| Exfiltration | T1567 Exfiltration Over Web Service | Dữ liệu gửi đến kẻ tấn công qua Telegram Bot API |

## 🔍 Phân tích kỹ thuật chi tiết

### Giai đoạn 1: Initial Access & Execution

Cuộc tấn công bắt đầu với email phishing được chế tạo chứa game bị trojan hóa làm tệp đính kèm. Kỹ thuật social engineering thuyết phục nạn nhân tải xuống và thực thi ứng dụng.

### Giai đoạn 2: Thực thi Payload

Khi thực thi, game Snake chạy bình thường như mồi nhử, không có dấu hiệu hoạt động độc hại nào. Trong khi đó, keylogger nhúng khởi tạo và bắt đầu bắt tất cả đầu vào bàn phím sử dụng thư viện pynput.

### Giai đoạn 3: Thu thập thông tin đăng nhập

Malware thực hiện hai loại đánh cắp thông tin đăng nhập:

- **Keylogging:** Tất cả phím bấm được bắt và lưu trữ cục bộ trong file log ẩn.
- **Trích xuất thông tin đăng nhập trình duyệt:** Malware truy cập cơ sở dữ liệu SQLite `Login Data` của Chrome, giải mã mật khẩu đã lưu sử dụng Windows DPAPI, và thu thập thông tin đăng nhập đã lưu.

### Giai đoạn 4: Cơ chế Persistence

Để duy trì truy cập qua các lần khởi động lại hệ thống, malware sao chép chính nó vào thư mục Startup Windows, đảm bảo tự động thực thi lại mỗi lần đăng nhập.

### Giai đoạn 5: C2 Exfiltration

Dữ liệu thu thập được truyền đến kẻ tấn công qua yêu cầu HTTPS đến Telegram Bot API. Kỹ thuật này tận dụng cơ sở hạ tầng đám mây hợp pháp, làm cho phát hiện dựa trên mạng trở nên khó khăn.

## 🛡️ Phát hiện & Giảm thiểu (Góc nhìn Blue Team)

### Chiến lược phát hiện

- **Phát hiện Endpoint:** Giám sát các quy trình truy cập cơ sở dữ liệu `Login Data` của Chrome hoặc khóa mã hóa `Local State`.
- **Phân tích hành vi:** Đánh dấu các ứng dụng thực hiện yêu cầu HTTPS đến `api.telegram.org` không được whitelist rõ ràng.
- **Giám sát Persistence:** Cảnh báo về các file mới được tạo trong thư mục Startup, đặc biệt là scripts hoặc executables.
- **Phát hiện Keylogger:** Giải pháp EDR có thể phát hiện các cuộc gọi API `SetWindowsHookEx` hoặc đăng ký keyboard hook bất thường.

### Khuyến nghị giảm thiểu

1. Triển khai Application Whitelisting để ngăn các executables không được phép chạy.
2. Triển khai Email Security Gateways với sandboxing tệp đính kèm.
3. Bật Windows Credential Guard để bảo vệ kho thông tin đăng nhập trình duyệt.
4. Sử dụng Network Segmentation để hạn chế kết nối outbound đến các domain C2 đã biết.
5. Tiến hành Security Awareness Training thường xuyên để nhận biết phishing.

## ⚠️ Tuyên bố giáo dục

Dự án này được phát triển hoàn toàn cho mục đích giáo dục và nghiên cứu để minh họa các kỹ thuật malware và cách phát hiện của chúng. Tất cả thử nghiệm được tiến hành trong môi trường lab cô lập. Các kỹ thuật được minh họa không bao giờ nên được sử dụng cho các hoạt động bất hợp pháp hoặc phi đạo đức.
