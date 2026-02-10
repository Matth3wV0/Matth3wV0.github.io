---
id: nids
title: "Hệ thống NIDS Hybrid"
description: "Hệ thống phát hiện xâm nhập mạng tiên tiến kết hợp phát hiện dựa trên chữ ký Suricata với phát hiện bất thường Machine Learning. Đào tạo trên CICIDS2017 với XGBoost đạt độ chính xác 99.46%. Tính năng phát hiện vòng lặp 8 bước, phân tích hành vi và cảnh báo Telegram thời gian thực."
category: security
icon: shield-check
color: green
tags:
  - "ELK Stack"
  - "Machine Learning"
  - "MITRE ATT&CK"
  - "Python"
stats:
  - value: "99.46%"
    label: "Độ chính xác"
  - value: "< 2s"
    label: "Thời gian phản hồi"
hasModal: true
span: 2
github: "https://github.com/Matth3wV0/A-Suricata-and-Machine-Learning-Based-Hybrid-Network-Intrusion-Detection-System"
order: 1
---

## 📋 Tóm tắt

Hệ thống phát hiện xâm nhập mạng hybrid tiên tiến kết hợp phát hiện dựa trên chữ ký Suricata với phát hiện bất thường Machine Learning (Decision Tree, Random Forest, XGBoost). Được đào tạo trên tập dữ liệu CICIDS2017 với độ chính xác 99.46%, tính năng cảnh báo thời gian thực qua Telegram API và phân tích hành vi toàn diện.

## 🔄 Quy trình hoạt động

Hệ thống hoạt động thông qua quy trình vòng lặp 8 bước để đảm bảo không bỏ sót mối đe dọa nào:

1. **Thiết lập Baseline:** Dữ liệu lưu lượng mạng bình thường đào tạo mô hình ML, tạo ngưỡng hành vi.
2. **Sniffing:** Bắt gói tin tốc độ cao kết nối với cổng SPAN không gây độ trễ mạng.
3. **Phân tích chữ ký (SNIDS):** Suricata kiểm tra gói tin với các quy tắc chữ ký đã biết.
4. **Cảnh báo ngay lập tức:** Các cuộc tấn công đã biết kích hoạt cảnh báo tức thì khi khớp chữ ký.
5. **Chuyển tiếp đến ADNIDS:** Các gói tin không khớp được chuyển đến thành phần phát hiện bất thường ML.
6. **Phân tích ML:** ADNIDS so sánh đặc điểm gói tin với baseline đã thiết lập.
7. **Cảnh báo bất thường:** Các sai lệch đáng kể kích hoạt cảnh báo tấn công zero-day.
8. **Cập nhật hệ thống:** Các mẫu tấn công mới phát hiện được phản hồi để nâng cao cơ sở dữ liệu chữ ký.

## 🤖 Trách nhiệm AI Engineer

| Lĩnh vực | Nhiệm vụ | Chi tiết kỹ thuật |
|----------|----------|-------------------|
| Tiền xử lý dữ liệu | Tập dữ liệu CICIDS2017 | 2.2M mẫu bình thường + 557k mẫu tấn công, cân bằng & làm sạch |
| Feature Engineering | 78 → 9 Features | Loại bỏ features hằng số/tương quan, ánh xạ vào logs Suricata |
| Đào tạo mô hình | Ensemble ML | DT (20%) + RF (30%) + XGBoost (50%) bình chọn có trọng số |
| Tích hợp | Pipeline thời gian thực | Suricata eve.json → Trích xuất Features → ML Inference |

## 📊 Mô hình Machine Learning

Ba thuật toán ML bổ sung tạo thành ensemble để phát hiện mạnh mẽ:

| Mô hình | Độ chính xác | Trọng số | Vai trò |
|---------|--------------|----------|---------|
| Decision Tree | 99.19% | 20% | Phát hiện baseline nhanh |
| Random Forest | 99.38% | 30% | Cân bằng precision/recall |
| XGBoost | 99.46% | 50% | Bộ phát hiện chính, tinh chỉnh qua GridSearchCV |

## 🎯 Phát hiện tấn công hành vi

| Loại tấn công | Logic phát hiện | Ngưỡng |
|---------------|-----------------|--------|
| Port Scan | `ports_in_window / ips_in_window > 10` | score > 0.7 |
| Host Scan | `ips_in_window / ports_in_window > 5` | score > 0.7 |
| Brute Force | `auth_failures to same service > 3` | score > 0.7 |
| Volume Anomaly | `bytes/sec > 1MB OR packets/sec > 1000` | score > 0.7 |

## 🚨 Hệ thống cảnh báo thông minh

Ngoài phát hiện bất thường đơn giản, hệ thống cung cấp phân tích toàn diện:

- **Điểm bất thường tổng hợp:** Tổng hợp có trọng số từ tất cả 3 mô hình ML để tính điểm tin cậy.
- **Bất thường thống kê:** Phân tích Z-score xác định chính xác các features sai lệch khỏi baseline.
- **Phân loại mức độ nghiêm trọng:** Tự động phân loại cảnh báo (Thấp/Trung bình/Cao) dựa trên độ tin cậy mô hình và ngữ cảnh giao thức.
- **Thông báo Telegram thời gian thực:** Cảnh báo tức thì với ngữ cảnh tấn công đầy đủ cho vận hành viên SOC.

## 🛠️ Công nghệ sử dụng

- **Ngôn ngữ:** Python 3 (tối ưu AI/ML)
- **Thư viện ML:** Scikit-learn, XGBoost, Pandas, Numpy
- **IDS Engine:** Suricata (eve.json log parser)
- **Cảnh báo:** Telegram Bot API, File Logging, CSV Export
- **Dataset:** CICIDS2017 (DoS, DDoS, Brute Force, Web Attacks, Infiltration)
