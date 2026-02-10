---
id: gimme-your-point
title: "Gimme Your Point"
description: "SharePoint CVE-2025-49704 exploitation with credential theft analysis"
category: web
event: "VCSPassport2025"
flag: "VCSPassport{SH4R3_y0R_P$$wD}"
mitre:
  - id: "T1190"
    name: "Exploit Public-Facing Application"
    desc: "SharePoint deserialization"
  - id: "T1059.001"
    name: "PowerShell"
    desc: "Payload execution"
  - id: "T1555.003"
    name: "Credentials from Password Stores"
    desc: "Chrome credential theft"
  - id: "T1560.001"
    name: "Archive Collected Data"
    desc: "Password-protected ZIP"
order: 3
---

## 📋 Executive Summary

A sophisticated attack simulation exploiting **CVE-2025-49704**, a SharePoint deserialization vulnerability in the ToolShell component. This challenge recreates a real-world case study where attackers embed deserialization payloads into the `MSOTlPn_DWP` parameter of POST requests to achieve RCE and exfiltrate Chrome browser credentials.

## 🔍 Phase 1: Initial PCAP Analysis

Opening the challenge PCAP file in Wireshark, I observed HTTP GET requests returning a `start.aspx` file - indicating a web-based attack. I used **Wireshark's Export Objects** feature to extract all HTTP files.

Using `strings` and `file` commands to analyze extracted files, I discovered a suspicious encoded `CompressedDataTable` value in `ToolPane.aspx`.

## 🔍 Phase 2: CVE Research - ToolShell Vulnerability

Searching for "CompressedDataTable SharePoint" led me to VCS's security article about **ToolShell** - a critical SharePoint vulnerability chain being actively exploited in the wild.

## 🔍 Phase 3: Payload Decoding

I extracted the `CompressedDataTable` value and performed Base64 decode → GZIP decompress, revealing a shell payload with a PowerShell command.

## 🔍 Phase 4: Malware Analysis

Following the PowerShell steps, I obtained `health_check.exe`. Running this executable revealed credential theft behavior.

## 💡 Phase 5: The Breakthrough - IDA Reverse Engineering

Returning to the PCAP, I found a POST request to `/upload` with the exfiltrated ZIP (signature `50 4b 03 04`). The ZIP required a password, so I loaded `health_check.exe` into **IDA Pro**.

Searching for "pass" revealed three functions: `GenPass1`, `GenPass2`, `GenPass3`. Following these in IDA View-A, I reconstructed the password.

Using this password to extract the ZIP, I examined `chrome_health_result` and found the URL containing the flag.

## 🛡️ Detection Strategy (Blue Team)

- **Network:** Monitor SharePoint for anomalous `CompressedDataTable` parameters
- **Endpoint:** Alert on `certutil -decode` execution chains
- **Behavioral:** Detect Chrome database access by non-browser processes
- **Exfiltration:** Monitor ZIP creation in `C:\Windows\Temp` with immediate uploads
