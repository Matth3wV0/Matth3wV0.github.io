"""
Script dịch nội dung từ en.json sang tiếng Việt sử dụng Ollama translategemma:4b
Gửi batch 5-10 câu mỗi lần để tối ưu hiệu suất
"""

import json
import requests
from typing import Dict, List
import time

# Cấu hình Ollama
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "translategemma:4b"
BATCH_SIZE = 8  # Số câu mỗi batch (5-10)

def load_json(filepath: str) -> Dict[str, str]:
    """Đọc file JSON và trả về dict"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filepath: str, data: Dict[str, str]):
    """Lưu dict vào file JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def translate_batch(texts: List[Dict[str, str]]) -> Dict[str, str]:
    """
    Dịch một batch các câu tiếng Anh sang tiếng Việt
    Args:
        texts: List các dict với format {"key": key, "text": text}
    Returns:
        Dict với key là key gốc và value là bản dịch
    """
    # Tạo format input rõ ràng cho model
    input_lines = []
    for i, item in enumerate(texts):
        input_lines.append(f"{i+1}. [{item['key']}]: {item['text']}")
    
    input_text = "\n".join(input_lines)
    
    # Prompt yêu cầu dịch với output format cố định
    prompt = f"""Dịch các câu tiếng Anh sau sang tiếng Việt. 
Giữ nguyên format output như sau, mỗi dòng là: [key]: bản_dịch_tiếng_việt
Không thêm số thứ tự, không giải thích, chỉ dịch nội dung.

Input:
{input_text}

Output (chỉ dịch, giữ nguyên key trong ngoặc vuông):"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,  # Giảm temperature để output ổn định hơn
                    "num_predict": 2048
                }
            },
            timeout=120
        )
        response.raise_for_status()
        
        result = response.json()
        response_text = result.get("response", "")
        
        # Parse response
        translations = {}
        for line in response_text.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            
            # Tìm pattern [key]: translation
            if line.startswith("[") and "]: " in line:
                try:
                    bracket_end = line.index("]:")
                    key = line[1:bracket_end]
                    translation = line[bracket_end + 3:].strip()
                    translations[key] = translation
                except (ValueError, IndexError):
                    continue
            # Fallback: pattern key: translation (không có ngoặc vuông)
            elif ": " in line:
                parts = line.split(": ", 1)
                if len(parts) == 2:
                    key = parts[0].strip().strip("[]").strip()
                    # Kiểm tra xem key có trong input không
                    for item in texts:
                        if item['key'] == key:
                            translations[key] = parts[1].strip()
                            break
        
        return translations
        
    except requests.exceptions.RequestException as e:
        print(f"Lỗi kết nối Ollama: {e}")
        return {}
    except json.JSONDecodeError as e:
        print(f"Lỗi parse JSON response: {e}")
        return {}

def translate_file(input_file: str, output_file: str):
    """
    Dịch toàn bộ file en.json sang vi.json
    """
    print(f"Đang đọc file {input_file}...")
    en_data = load_json(input_file)
    
    # Chuẩn bị danh sách các mục cần dịch
    items = [{"key": k, "text": v} for k, v in en_data.items()]
    total_items = len(items)
    
    print(f"Tổng số mục cần dịch: {total_items}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Số batch: {(total_items + BATCH_SIZE - 1) // BATCH_SIZE}")
    print("-" * 50)
    
    vi_data = {}
    
    # Chia thành các batch và dịch
    for i in range(0, total_items, BATCH_SIZE):
        batch = items[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        total_batches = (total_items + BATCH_SIZE - 1) // BATCH_SIZE
        
        print(f"\nĐang dịch batch {batch_num}/{total_batches}...")
        print(f"  Keys: {[item['key'] for item in batch]}")
        
        translations = translate_batch(batch)
        
        # Kiểm tra và bổ sung các mục bị thiếu
        for item in batch:
            key = item['key']
            if key in translations:
                vi_data[key] = translations[key]
                print(f"  ✓ {key}")
            else:
                # Nếu không dịch được, thử dịch riêng từng câu
                print(f"  ⚠ {key} - Đang thử dịch lại riêng...")
                single_translation = translate_batch([item])
                if key in single_translation:
                    vi_data[key] = single_translation[key]
                    print(f"  ✓ {key} (dịch lại thành công)")
                else:
                    # Giữ nguyên text gốc nếu không dịch được
                    vi_data[key] = item['text']
                    print(f"  ✗ {key} - Giữ nguyên text gốc")
        
        # Delay ngắn giữa các batch để tránh quá tải
        time.sleep(0.5)
    
    # Lưu kết quả
    print("\n" + "-" * 50)
    print(f"Đang lưu file {output_file}...")
    save_json(output_file, vi_data)
    
    # Thống kê
    translated_count = sum(1 for k, v in vi_data.items() if v != en_data.get(k, ""))
    print(f"\n✓ Hoàn thành!")
    print(f"  - Tổng số mục: {total_items}")
    print(f"  - Đã dịch: {translated_count}")
    print(f"  - Giữ nguyên: {total_items - translated_count}")

if __name__ == "__main__":
    input_file = "en.json"
    output_file = "vi.json"
    
    print("=" * 50)
    print("DỊCH EN.JSON SANG TIẾNG VIỆT VỚI OLLAMA")
    print("=" * 50)
    
    # Kiểm tra Ollama có chạy không
    try:
        test_response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if test_response.status_code != 200:
            print("❌ Ollama không phản hồi. Hãy đảm bảo Ollama đang chạy.")
            exit(1)
        print("✓ Ollama đang chạy")
        
        # Kiểm tra model có tồn tại không
        models = test_response.json().get("models", [])
        model_names = [m.get("name", "").split(":")[0] for m in models]
        if "translategemma" not in model_names and "translategemma:4b" not in [m.get("name", "") for m in models]:
            print(f"⚠ Model '{MODEL_NAME}' có thể chưa được cài đặt.")
            print(f"  Các model hiện có: {[m.get('name', '') for m in models]}")
            print(f"  Để cài đặt, chạy: ollama pull {MODEL_NAME}")
            user_input = input("Tiếp tục không? (y/n): ")
            if user_input.lower() != 'y':
                exit(0)
        else:
            print(f"✓ Model '{MODEL_NAME}' đã sẵn sàng")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Không thể kết nối Ollama: {e}")
        print("Hãy đảm bảo Ollama đang chạy (ollama serve)")
        exit(1)
    
    print()
    translate_file(input_file, output_file)
