// Language data for EN and VI
const langData = {
    "en": {
        // Navigation
        "nav_projects": "Projects",
        "nav_vault": "CTF Vault",
        "nav_experience": "Experience",
        "nav_certifications": "Certifications",

        // Hero Section
        "hero_status": "Status:",
        "hero_status_value": "Active",
        "hero_role": "Security Engineer | Automation Specialist",
        "hero_description": "Building secure systems and automating complex workflows. Passionate about threat detection, algo-trading, and CTF challenges.",
        "hero_btn_projects": "View Projects",
        "hero_btn_ctf": "CTF Write-ups",

        // Sections
        "section_projects": "Engineering Projects",
        "section_vault": "The Vault",
        "section_vault_subtitle": "CTF Write-up Archive",
        "section_experience": "Experience",
        "section_certifications": "Certifications",

        // Projects
        "project_nids_title": "Hybrid NIDS",
        "project_nids_desc": "Network Intrusion Detection System combining ELK Stack with Machine Learning for real-time threat detection. Mapped to MITRE ATT&CK framework.",
        "project_nids_stat1": "Detection Accuracy",
        "project_nids_stat2": "Response Time",
        "project_trading_title": "Prospire Algo-Trading",
        "project_trading_desc": "Automated trading platform with decision algorithms for market analysis.",
        "project_trading_stat": "/week volume",
        "project_bot_title": "Financial Telegram Bot & Python Scrapers",
        "project_bot_desc": "Automated data collection with Producer-Consumer pattern for high-throughput processing.",

        // Filters
        "filter_all": "All",
        "filter_forensic": "Forensic",
        "filter_reverse": "Reverse",
        "filter_web": "Web",

        // CTF Cards
        "ctf_view": "View analysis",

        // Experience
        "exp_prospire_role": "Co-founder & Tech Lead",
        "exp_prospire_desc": "Building algo-trading platform and automation solutions. Leading technical architecture and security implementation.",
        "exp_hpt_role": "Security Training Program",
        "exp_hpt_desc": "Completed advanced security training with top performance. Focus on network security and threat analysis.",
        "exp_viettel_role": "Security Intern",
        "exp_viettel_desc": "Gained hands-on experience in enterprise security operations and data center infrastructure.",

        // Certifications
        "cert_partner_cloud_title": "Partner: Cloud Security",
        "cert_partner_cloud_desc": "Cisco Partner Specialization",
        "cert_cyberops_title": "CyberOps Associate",
        "cert_cyberops_desc": "Cisco Certified CyberOps Associate",
        "cert_hpt_title": "HPT On-Job Training",
        "cert_hpt_desc": "Certificate of Completion",
        "cert_ccna_intro_title": "CCNAv7: Intro to Networks",
        "cert_ccna_intro_desc": "Cisco Networking Academy",
        "cert_ccna_switch_title": "CCNA: Switching, Routing, Wireless",
        "cert_ccna_switch_desc": "Cisco Networking Academy",
        "cert_honor_fall23_title": "Honorable Student (Fall 2023)",
        "cert_honor_fall23_desc": "Academic Excellence Award",
        "cert_honor_fall24_title": "Honorable Student (Fall 2024)",
        "cert_honor_fall24_desc": "Academic Excellence Award",
        "cert_honor_spring25_title": "Honorable Student (Spring 2025)",
        "cert_honor_spring25_desc": "Academic Excellence Award",

        // Footer
        "footer_text": "© 2026 Võ Trọng Đức. Built with precision.",

        // Write-ups Generic
        "wu_phase1": "Phase 1",
        "wu_phase2": "Phase 2",
        "wu_phase3": "Phase 3",
        "wu_phase4": "Phase 4",
        "wu_challenge": "Challenge",
        "wu_attack_chain": "Attack Chain",
        "wu_flag": "Flag",
        "wu_tools": "Tools Used",
        "wu_detection": "Detection Indicators",
        "wu_obfuscation": "Obfuscation Techniques",

        // Give Me Your Point (gyp)
        "gyp_title": "Gimme Your Point",
        "gyp_subtitle": "SharePoint CVE-2025-49704 & Malware Analysis",
        "gyp_challenge_desc": "\"Sniff sniff this traffic to get your POINT but do not SHARE it!!!\" - A PCAP file containing network traffic that conceals a sophisticated SharePoint exploitation attempt leveraging CVE-2025-49704 deserialization vulnerability.",
        "gyp_phase1_title": "Traffic Analysis",
        "gyp_phase1_desc": "Initial analysis in Wireshark revealed suspicious HTTP requests to start.aspx and ToolPane.aspx. Using Export HTTP Objects, I extracted several files including a suspicious parameter named CompressedDataTable containing a large base64-encoded string.",
        "gyp_phase2_title": "Vulnerability Research",
        "gyp_phase2_desc": "Searching for \"CompressedDataTable\" led to VCS research on ToolShell – SharePoint vulnerability chain. This attack embeds deserialization payloads (XML/.NET serialized objects) into the MSOTlPn_DWP parameter of a POST request, exploiting CVE-2025-49704.",
        "gyp_phase3_title": "Malware Execution Chain",
        "gyp_phase3_desc": "The decoded payload contains a staged PowerShell command that downloads raw_package, decodes it twice using certutil, and executes the final health_check.exe malware.",
        "gyp_phase4_title": "Binary Reverse Engineering",
        "gyp_phase4_desc": "Running the malware created a password-protected ZIP in %TEMP% containing Chrome credential files. Using IDA Pro, I found three functions: GenPass1, GenPass2, GenPass3 that generated the ZIP password.",
        "gyp_chain_1": "SharePoint deserialization via CompressedDataTable",
        "gyp_chain_2": "PowerShell payload execution",
        "gyp_chain_3": "Credential stealer deployment",
        "gyp_chain_4": "Data exfiltration via HTTP POST",

        // FOR2 (for2)
        "for2_title": "FOR2 - ICMP Backdoor",
        "for2_subtitle": "PCAP Analysis & C2 Command Extraction",
        "for2_challenge_desc": "Analyze a PCAPNG file containing network traffic along with an attacker's backdoor binary (oci.bin). The goal is to identify the C2 communication channel and extract the hidden flag.",
        "for2_phase1_title": "Traffic Analysis",
        "for2_phase1_desc": "Filtering by protocol in Wireshark revealed suspicious ICMP Request and Reply packets. One packet contained a command string indicating file download activity from the victim machine.",
        "for2_phase2_title": "Data Extraction",
        "for2_phase2_desc": "The actual flag data was transmitted character by character via ICMP packet payloads. By extracting and converting the hex data from these packets, the flag was reconstructed.",
        "for2_detect_1": "ICMP packets with ASCII data in payload",
        "for2_detect_2": "Unusual file path references in traffic",
        "for2_detect_3": "Sequential data exfiltration pattern",

        // RE02 (re02)
        "re02_title": "RE02 - Excel Macro Analysis",
        "re02_subtitle": "XLM Macro De-obfuscation with oletools",
        "re02_challenge_desc": "Analyze an Excel file (RE02.xls) containing an obfuscated macro that launches Windows Calculator when executed. The flag is hidden within the obfuscated macro logic.",
        "re02_phase1_title": "Initial Discovery",
        "re02_phase1_desc": "Running the strings command revealed a suspicious hint:",
        "re02_phase2_title": "Deep Analysis with olevba",
        "re02_phase2_desc": "Using the olevba tool from oletools suite to extract and analyze the XLM macro, the exact cell values were identified:",
        "re02_phase3_title": "Solution",
        "re02_phase3_desc": "The key insight was that the strings in cells B128 and E178 needed to be reversed, while D70 was used as-is. After adjusting for the correct spelling (without the extra 'S'), the flag was assembled: VCS{MY_SUPERPOWER_IS_RICH}",
        "re02_obf_1": "String reversal in specific cells",
        "re02_obf_2": "Data split across multiple cells",
        "re02_obf_3": "Hidden hint in file metadata"
    },
    "vi": {
        // Navigation
        "nav_projects": "Dự án",
        "nav_vault": "Kho CTF",
        "nav_experience": "Kinh nghiệm",
        "nav_certifications": "Chứng chỉ",

        // Hero Section
        "hero_status": "Trạng thái:",
        "hero_status_value": "Đang hoạt động",
        "hero_role": "Kỹ sư An ninh mạng | Chuyên gia Tự động hóa",
        "hero_description": "Xây dựng hệ thống bảo mật và tự động hóa quy trình phức tạp. Đam mê phát hiện mối đe dọa, giao dịch thuật toán và các thử thách CTF.",
        "hero_btn_projects": "Xem Dự án",
        "hero_btn_ctf": "Bài Write-up CTF",

        // Sections
        "section_projects": "Dự án Kỹ thuật",
        "section_vault": "Kho Lưu trữ",
        "section_vault_subtitle": "Bài Write-up CTF",
        "section_experience": "Kinh nghiệm",
        "section_certifications": "Chứng chỉ",

        // Projects
        "project_nids_title": "NIDS Kết hợp",
        "project_nids_desc": "Hệ thống Phát hiện Xâm nhập Mạng kết hợp ELK Stack với Machine Learning để phát hiện mối đe dọa theo thời gian thực. Ánh xạ theo MITRE ATT&CK framework.",
        "project_nids_stat1": "Độ chính xác",
        "project_nids_stat2": "Thời gian phản hồi",
        "project_trading_title": "Prospire Algo-Trading",
        "project_trading_desc": "Nền tảng giao dịch tự động với thuật toán quyết định để phân tích thị trường.",
        "project_trading_stat": "/tuần khối lượng",
        "project_bot_title": "Bot Telegram Tài chính & Python Scrapers",
        "project_bot_desc": "Thu thập dữ liệu tự động với mô hình Producer-Consumer cho xử lý thông lượng cao.",

        // Filters
        "filter_all": "Tất cả",
        "filter_forensic": "Pháp y số",
        "filter_reverse": "Dịch ngược",
        "filter_web": "Web",

        // CTF Cards
        "ctf_view": "Xem phân tích",

        // Experience
        "exp_prospire_role": "Đồng sáng lập & Trưởng nhóm Kỹ thuật",
        "exp_prospire_desc": "Xây dựng nền tảng giao dịch thuật toán và giải pháp tự động hóa. Dẫn dắt kiến trúc kỹ thuật và triển khai bảo mật.",
        "exp_hpt_role": "Chương trình Đào tạo An ninh mạng",
        "exp_hpt_desc": "Hoàn thành khóa đào tạo bảo mật nâng cao với kết quả xuất sắc. Tập trung vào an ninh mạng và phân tích mối đe dọa.",
        "exp_viettel_role": "Thực tập sinh An ninh mạng",
        "exp_viettel_desc": "Tích lũy kinh nghiệm thực tế trong vận hành bảo mật doanh nghiệp và cơ sở hạ tầng trung tâm dữ liệu.",

        // Certifications
        "cert_partner_cloud_title": "Đối tác: Bảo mật Đám mây",
        "cert_partner_cloud_desc": "Chuyên môn Đối tác Cisco",
        "cert_cyberops_title": "CyberOps Associate",
        "cert_cyberops_desc": "Chứng chỉ Cisco Certified CyberOps Associate",
        "cert_hpt_title": "Thực tập HPT",
        "cert_hpt_desc": "Chứng nhận Hoàn thành",
        "cert_ccna_intro_title": "CCNAv7: Nhập môn Mạng",
        "cert_ccna_intro_desc": "Học viện Mạng Cisco",
        "cert_ccna_switch_title": "CCNA: Chuyển mạch, Định tuyến, Không dây",
        "cert_ccna_switch_desc": "Học viện Mạng Cisco",
        "cert_honor_fall23_title": "Sinh viên Giỏi (Mùa Thu 2023)",
        "cert_honor_fall23_desc": "Giải thưởng Thành tích Học tập",
        "cert_honor_fall24_title": "Sinh viên Giỏi (Mùa Thu 2024)",
        "cert_honor_fall24_desc": "Giải thưởng Thành tích Học tập",
        "cert_honor_spring25_title": "Sinh viên Giỏi (Mùa Xuân 2025)",
        "cert_honor_spring25_desc": "Giải thưởng Thành tích Học tập",

        // Footer
        "footer_text": "© 2026 Võ Trọng Đức. Được xây dựng với sự tỉ mỉ.",

        // Write-ups Generic
        "wu_phase1": "Giai đoạn 1",
        "wu_phase2": "Giai đoạn 2",
        "wu_phase3": "Giai đoạn 3",
        "wu_phase4": "Giai đoạn 4",
        "wu_challenge": "Thử thách",
        "wu_attack_chain": "Chuỗi tấn công",
        "wu_flag": "Flag",
        "wu_tools": "Công cụ sử dụng",
        "wu_detection": "Dấu hiệu nhận biết",
        "wu_obfuscation": "Kỹ thuật làm rối",

        // Give Me Your Point (gyp)
        "gyp_title": "Gimme Your Point",
        "gyp_subtitle": "SharePoint CVE-2025-49704 & Phân tích mã độc",
        "gyp_challenge_desc": "\"Sniff sniff this traffic to get your POINT but do not SHARE it!!!\" - File PCAP chứa lưu lượng mạng ẩn giấu một cuộc tấn công SharePoint khai thác lỗ hổng deserialization CVE-2025-49704.",
        "gyp_phase1_title": "Phân tích lưu lượng",
        "gyp_phase1_desc": "Phân tích ban đầu trong Wireshark cho thấy các yêu cầu HTTP đáng ngờ đến start.aspx và ToolPane.aspx. Sử dụng Export HTTP Objects, tôi đã trích xuất được một số tệp bao gồm một tham số đáng ngờ tên là CompressedDataTable chứa chuỗi mã hóa base64 lớn.",
        "gyp_phase2_title": "Nghiên cứu lỗ hổng",
        "gyp_phase2_desc": "Tìm kiếm \"CompressedDataTable\" dẫn đến nghiên cứu của VCS về ToolShell – chuỗi lỗ hổng SharePoint. Cuộc tấn công này nhúng payload deserialization (đối tượng XML/.NET serialized) vào tham số MSOTlPn_DWP của yêu cầu POST, khai thác CVE-2025-49704.",
        "gyp_phase3_title": "Chuỗi thực thi mã độc",
        "gyp_phase3_desc": "Payload sau khi giải mã chứa một lệnh PowerShell tải xuống raw_package, giải mã nó hai lần bằng certutil, và thực thi mã độc cuối cùng health_check.exe.",
        "gyp_phase4_title": "Dịch ngược mã nhị phân",
        "gyp_phase4_desc": "Chạy mã độc tạo ra một tệp ZIP có mật khẩu trong %TEMP% chứa thông tin xác thực Chrome. Sử dụng IDA Pro, tôi tìm thấy ba hàm: GenPass1, GenPass2, GenPass3 tạo ra mật khẩu ZIP.",
        "gyp_chain_1": "SharePoint deserialization qua CompressedDataTable",
        "gyp_chain_2": "Thực thi payload PowerShell",
        "gyp_chain_3": "Triển khai phần mềm trộm thông tin",
        "gyp_chain_4": "Gửi dữ liệu qua HTTP POST",

        // FOR2 (for2)
        "for2_title": "FOR2 - ICMP Backdoor",
        "for2_subtitle": "Phân tích PCAP & Trích xuất lệnh C2",
        "for2_challenge_desc": "Phân tích file PCAPNG chứa lưu lượng mạng cùng với binary backdoor của kẻ tấn công (oci.bin). Mục tiêu là xác định kênh giao tiếp C2 và trích xuất flag ẩn.",
        "for2_phase1_title": "Phân tích lưu lượng",
        "for2_phase1_desc": "Lọc theo giao thức trong Wireshark cho thấy các gói tin ICMP Request và Reply đáng ngờ. Một gói tin chứa chuỗi lệnh chỉ ra hoạt động tải xuống tệp từ máy nạn nhân.",
        "for2_phase2_title": "Trích xuất dữ liệu",
        "for2_phase2_desc": "Dữ liệu flag thực sự được truyền từng ký tự qua payload của gói tin ICMP. Bằng cách trích xuất và chuyển đổi dữ liệu hex từ các gói tin này, flag đã được khôi phục.",
        "for2_detect_1": "Gói tin ICMP chứa dữ liệu ASCII trong payload",
        "for2_detect_2": "Đường dẫn tệp bất thường trong lưu lượng",
        "for2_detect_3": "Mô hình trích xuất dữ liệu tuần tự",

        // RE02 (re02)
        "re02_title": "RE02 - Phân tích Excel Macro",
        "re02_subtitle": "Gỡ rối Macro XLM với oletools",
        "re02_challenge_desc": "Phân tích file Excel (RE02.xls) chứa macro bị làm rối sẽ khởi chạy Windows Calculator khi thực thi. Flag được ẩn trong logic macro bị làm rối.",
        "re02_phase1_title": "Khám phá ban đầu",
        "re02_phase1_desc": "Chạy lệnh strings đã tiết lộ một gợi ý đáng ngờ:",
        "re02_phase2_title": "Phân tích sâu với olevba",
        "re02_phase2_desc": "Sử dụng công cụ olevba từ bộ oletools để trích xuất và phân tích macro XLM, các giá trị ô chính xác đã được xác định:",
        "re02_phase3_title": "Giải pháp",
        "re02_phase3_desc": "Điểm mấu chốt là các chuỗi trong ô B128 và E178 cần được đảo ngược, trong khi D70 được sử dụng nguyên trạng. Sau khi điều chỉnh chính tả đúng (bỏ chữ 'S' thừa), flag đã được lắp ghép: VCS{MY_SUPERPOWER_IS_RICH}",
        "re02_obf_1": "Đảo ngược chuỗi trong các ô cụ thể",
        "re02_obf_2": "Chia nhỏ dữ liệu qua nhiều ô",
        "re02_obf_3": "Gợi ý ẩn trong metadata của file"
    }
};

// Current language state
let currentLang = localStorage.getItem('lang') || 'en';

// Function to change language
function changeLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update all elements with data-i18n attribute
    updateContent(document);

    // Update toggle button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // If modal is open, ensure we update its content too (dynamic content)
    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
        updateContent(modalContent);
    }
}

// Update content helper
function updateContent(context) {
    context.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[currentLang] && langData[currentLang][key]) {
            // Check if element has 'Phase X' structure to preserve prefix if needed
            // For now, simple replacement is enough as data keys include "Phase X: Title"
            // Wait, we designed keys like "gyp_phase1_title": "Traffic Analysis" logic in index.html updates below
            // Actually, to support "Phase 1: Traffic Analysis", I can either:
            // 1. Put full string in JSON (easiest for now)
            // 2. Complicate logic to combine `wu_phase1` + `: ` + `gyp_phase1_title`

            // Checking my JSON above: "gyp_phase1_title": "Analysis" -> no, I put "Traffic Analysis".
            // In index.html, I should change the structure to:
            // <h3 ...><span data-i18n="wu_phase1">Phase 1</span>: <span data-i18n="gyp_phase1_title">Traffic Analysis</span></h3>
            // OR just put the full string in JSON "Phase 1: Traffic Analysis".
            // I chose full string in JSON above? No, I put "Traffic Analysis" for the title part in JSON for English.
            // Wait, let me check my JSON content again.
            // "gyp_phase1_title": "Traffic Analysis"
            // "wu_phase1": "Phase 1"

            // So in HTML I need to split them.
            el.textContent = langData[currentLang][key];
        }
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    changeLanguage(currentLang);
});
