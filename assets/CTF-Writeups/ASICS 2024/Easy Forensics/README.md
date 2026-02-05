# Easy Forensics

> **CTF:** ASICS 2024  
> **Category:** Memory Forensics  
> **Difficulty:** Medium  
> **Flag:** `ASCIS{Gh4st1n_Th3_R2M}`

---

## Executive Summary

This challenge demonstrates **memory forensics** techniques to investigate a Windows system compromised by fileless malware. The malware established **persistence through Windows Registry** Run keys, storing encoded credentials that were used to access a password-protected archive containing the flag.

**Key Techniques:**
- Memory Image Analysis with Volatility
- Windows Registry Forensics
- Persistence Mechanism Detection
- Base64 Payload Decoding

---

## Technical Analysis

### Phase 1: Artifact Extraction

The challenge provides `Memory.rar` containing:
- `Memory.raw` - Windows memory dump
- `Gift.rar` - Password-protected archive

### Phase 2: Memory Profile Identification

Using Volatility to identify the Windows profile:

```bash
volatility -f Memory.raw imageinfo
```

The profile was identified and used for subsequent analysis.

### Phase 3: Initial Investigation

Standard forensic techniques were applied:
- **Process listing** - No obviously malicious processes
- **DLL analysis** - No suspicious injected libraries
- **File scanning** - No interesting file artifacts

### Phase 4: Persistence Mechanism Research

Fileless malware commonly abuses Windows persistence mechanisms:
- Registry Run/RunOnce keys
- Scheduled Tasks
- WMI Subscriptions
- Startup Folder

Focus shifted to **Registry analysis** since fileless malware typically hides payloads in registry values.

### Phase 5: Registry Extraction

Examining the `SOFTWARE\Microsoft\Windows\CurrentVersion\Run` key:

```bash
volatility -f Memory.raw printkey -K "Software\Microsoft\Windows\CurrentVersion\Run"
```

**Discovery:** A suspicious Base64-encoded value in one of the Run key entries.

---

## The Breakthrough

### Encoded Payload
```
UGFzc3dvcmQgaXMge0ZpbGVsZXNzLU1hbHdhcmUtUGVyc2lzdGVuY2V9
```

### Decoded Result
```bash
echo "UGFzc3dvcmQgaXMge0ZpbGVsZXNzLU1hbHdhcmUtUGVyc2lzdGVuY2V9" | base64 -d
```

**Output:** `Password is {Fileless-Malware-Persistence}`

### Archive Extraction

Using the recovered password on `Gift.rar`:

```bash
unrar e Gift.rar
# Password: {Fileless-Malware-Persistence}
```

The extracted `Gift.txt` contained the flag.

---

## Flag & Solution

```
ASCIS{Gh4st1n_Th3_R2M}
```

---

## Detection Strategy (Blue Team)

### SIEM/EDR Rules
```yaml
# Sigma Rule - Registry Run Key Base64 Content
title: Suspicious Base64 in Registry Run Key
logsource:
    product: windows
    category: registry_set
detection:
    selection:
        TargetObject|contains:
            - '\CurrentVersion\Run'
            - '\CurrentVersion\RunOnce'
        Details|re: '^[A-Za-z0-9+/=]{20,}$'
    condition: selection

# Sigma Rule - Encoded PowerShell in Registry
title: PowerShell Encoded Command in Registry
detection:
    selection:
        Details|contains:
            - 'powershell'
            - '-enc'
            - 'FromBase64'
    condition: selection
```

### Volatility Commands for Persistence Detection
```bash
# Registry Run keys
volatility printkey -K "Software\Microsoft\Windows\CurrentVersion\Run"

# Services
volatility svcscan

# Scheduled Tasks (if applicable)
volatility malfind
```

### Key Registry Locations to Monitor
| Path | Purpose |
|------|---------|
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run` | Machine startup |
| `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run` | User startup |
| `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce` | One-time execution |
| `HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders` | Alternate startup |

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1547.001** | Boot or Logon Autostart: Registry Run Keys | Persistence via Run key |
| **T1027** | Obfuscated Files or Information | Base64 encoded payload |
| **T1140** | Deobfuscate/Decode Files | Base64 decoding reveals credentials |
| **T1552.002** | Unsecured Credentials: Credentials in Registry | Password stored in registry |

---

## Tools Used

- **Volatility 2/3** - Memory forensics framework
- **Base64 Decoder** - Payload decoding
- **unrar** - Archive extraction
- **Registry Explorer** - Windows registry analysis
