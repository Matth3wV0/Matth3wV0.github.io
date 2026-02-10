---
id: easy-forensics
title: "Easy Forensics"
description: "Memory forensics with Volatility and registry persistence analysis"
category: forensic
event: "ASCIS 2024"
flag: "ASCIS{Gh4st1n_Th3_R2M}"
mitre:
  - id: "T1547.001"
    name: "Registry Run Keys"
    desc: "Persistence via startup registry"
  - id: "T1027"
    name: "Obfuscated Files"
    desc: "Base64 encoded payload"
  - id: "T1059.001"
    name: "PowerShell"
    desc: "Fileless execution"
order: 2
---

## 📋 Executive Summary

Memory forensics challenge involving analysis of a Windows memory dump to identify fileless malware persistence mechanism. The attacker used registry Run keys to maintain persistence with Base64-encoded payload.

## 🔍 Technical Analysis

The problem starts with the Memory.rar file, after extracting it we get 2 files Memory.raw and Gift.raw.

![Challenge description](../../assets/img/ctf_dl/easy-forensics/4ba819f4-8b1e-4b7d-9ebb-8b8150f22bd2.png)
![Extracted files](../../assets/img/ctf_dl/easy-forensics/1170f784-f61f-4d0c-a5a0-159eb265e297.png)

Because this is a raw memory file, I used Volatility to analyze it.

![Volatility analysis](../../assets/img/ctf_dl/easy-forensics/38235985-43ab-44e6-a446-c58edc2b7528.png)
![File profile info](../../assets/img/ctf_dl/easy-forensics/8ec04db8-1e5a-4ab0-88e1-d5b94b3d7d18.png)

Based on the given data, I researched that persistence technique will use some ways for malware to turn on and start automatically when the system restarts. Malware often adds to the "Run" folder of the Windows Registry.

![Registry analysis](../../assets/img/ctf_dl/easy-forensics/d6530efb-e40e-42e3-9828-e79255d95355.png)

## 💡 The Breakthrough

And luckily I found a base64 encrypted code:

> UGFzc3dvcmQgaXMge0ZpbGVsZXNzLU1hbHdhcmUtUGVyc2lzdGVuY2V9

![Base64 code found](../../assets/img/ctf_dl/easy-forensics/00799e47-5d28-4cac-b45d-8a208a9a45f8.png)

Decrypted it and I got the password of the Gift.rar file. Extract Gift.rar file, I got the flag in Gift.txt file:

![Decrypted password](../../assets/img/ctf_dl/easy-forensics/11c658df-eeab-4faa-ac65-1b82a365de9d.png)

## 🛡️ Detection Strategy (Blue Team)

- Monitor Registry Run keys for suspicious entries
- Alert on Base64-encoded strings in registry values
- Use Volatility printkey plugin for memory analysis
- Detect fileless malware through PowerShell logging
