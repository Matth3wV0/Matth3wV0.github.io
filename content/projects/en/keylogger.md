---
id: keylogger
title: "Snake Game Keylogger"
description: "Proof-of-concept malware analysis lab simulating a full attack lifecycle: phishing delivery, credential harvesting, persistence, and C2 exfiltration via Telegram."
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
    label: "ATT&CK Techniques"
  - value: "Full"
    label: "Kill Chain"
hasModal: true
span: 2
video: "https://youtu.be/7qFA9ravRq4"
order: 4
---

## 📋 Executive Summary

This project is a controlled malware analysis lab designed to simulate the complete lifecycle of an information-stealing trojan. By embedding a keylogger within a seemingly harmless Snake game, it demonstrates how threat actors weaponize legitimate applications to evade detection.

## 🎯 Attack Scenario

A victim receives a phishing email containing an attached 'Snake Game'. Upon execution, the trojanized game operates normally while silently deploying credential-harvesting and persistence modules in the background.

## 🔴 MITRE ATT&CK Mapping

| Tactic | Technique | Implementation |
|--------|-----------|----------------|
| Initial Access | T1566.001 Phishing: Spear-phishing Attachment | Malicious game distributed via email |
| Execution | T1204.002 User Execution: Malicious File | Victim launches trojanized Snake game |
| Persistence | T1547.001 Boot or Logon Autostart: Registry Run Keys | Script added to Windows Startup folder |
| Credential Access | T1056.001 Input Capture: Keylogging | pynput library captures all keystrokes |
| Credential Access | T1555.003 Credentials from Password Stores: Browsers | Chrome SQLite database decryption via AES |
| Exfiltration | T1567 Exfiltration Over Web Service | Data sent to attacker via Telegram Bot API |

## 🔍 Technical Deep-Dive

### Phase 1: Initial Access & Execution

The attack begins with a crafted phishing email containing the trojanized game as an attachment. Social engineering techniques convince the victim to download and execute the application.

### Phase 2: Payload Execution

Upon execution, the Snake game runs normally as a decoy, providing no visible indication of malicious activity. Meanwhile, the embedded keylogger initializes and begins capturing all keyboard input using the pynput library.

### Phase 3: Credential Harvesting

The malware performs two types of credential theft:

- **Keylogging:** All keystrokes are captured and stored locally in a hidden log file.
- **Browser Credential Extraction:** The malware accesses Chrome's `Login Data` SQLite database, decrypts stored passwords using Windows DPAPI, and harvests saved credentials.

### Phase 4: Persistence Mechanism

To maintain access across system reboots, the malware copies itself to the Windows Startup folder, ensuring automatic re-execution on every login.

### Phase 5: C2 Exfiltration

Harvested data is transmitted to the attacker via HTTPS requests to the Telegram Bot API. This technique leverages legitimate cloud infrastructure, making network-based detection challenging.

## 🛡️ Detection & Mitigation (Blue Team Perspective)

### Detection Strategies

- **Endpoint Detection:** Monitor for processes accessing Chrome's `Login Data` database or `Local State` encryption key.
- **Behavioral Analysis:** Flag applications making HTTPS requests to `api.telegram.org` that were not explicitly whitelisted.
- **Persistence Monitoring:** Alert on new files created in the Startup folder, especially scripts or executables.
- **Keylogger Detection:** EDR solutions can detect `SetWindowsHookEx` API calls or unusual keyboard hook registrations.

### Mitigation Recommendations

1. Implement Application Whitelisting to prevent unauthorized executables from running.
2. Deploy Email Security Gateways with attachment sandboxing.
3. Enable Windows Credential Guard to protect browser credential stores.
4. Use Network Segmentation to restrict outbound connections to known C2 domains.
5. Conduct regular Security Awareness Training for phishing recognition.

## ⚠️ Educational Disclaimer

This project was developed strictly for educational and research purposes to demonstrate malware techniques and their detection. All testing was conducted in isolated lab environments. The techniques demonstrated should never be used for illegal or unethical activities. Always obtain proper authorization before conducting security testing.
