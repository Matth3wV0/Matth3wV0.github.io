# FOR2 — ICMP Covert Channel Analysis

## Case Overview

**Challenge:** FOR2
**Category:** Network Forensics
**Event:** VCSPassport 2024
**Flag:** `VCS{I_AM_LOSER}`

This forensic investigation analyzes a captured network traffic file to uncover a covert command-and-control (C2) channel operating over the ICMP protocol. The attacker exploited a custom backdoor (`oci.bin`) to issue commands via ICMP Echo Request/Reply packets, exfiltrating sensitive file contents from the compromised host through an unconventional data channel that bypasses traditional firewall rules.

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Observed Activity |
|---|---|---|
| `T1095` | Non-Application Layer Protocol | ICMP used as C2 communication channel |
| `T1048.003` | Exfiltration Over Alternative Protocol | File data hidden within ICMP packet payloads |
| `T1041` | Exfiltration Over C2 Channel | Flag file extracted through the ICMP tunnel |
| `T1001` | Data Obfuscation | Flag encoded as ASCII art characters across multiple packets |

---

## Forensic Analysis

### Phase 1: Evidence Acquisition & Initial Triage

The challenge provides two artifacts:
- **PCAPNG file** — captured network traffic from the victim host
- **`oci.bin`** — the attacker's backdoor binary

Upon opening the PCAPNG in Wireshark and filtering by protocol, ICMP Echo Request and Echo Reply packets are immediately visible between two hosts. The packet payloads are notably larger than standard ping traffic, suggesting embedded data.

![Wireshark — ICMP traffic overview with hex dump showing embedded data in packet payloads](../../img/vcspassport2024/image1.png)

### Phase 2: C2 Command Discovery

Detailed examination of individual ICMP packet payloads reveals embedded ASCII command strings. A critical ICMP Request packet contains the following data:

```
download C:\tmp\flag_1s_ck4mpj0n.txt
```

This is a clear indicator that the attacker is using the ICMP protocol as a covert C2 channel, issuing file download commands through the backdoor to exfiltrate the target file `flag_1s_ck4mpj0n.txt` from the victim's system.

![Wireshark — ICMP packet containing the download command for flag_1s_ck4mpj0n.txt](../../img/vcspassport2024/image2.png)

### Phase 3: Command Execution Confirmation

Following the packet stream from the download command, a TCP packet appears immediately afterwards containing the confirmation message:

```
openfile on remote computers success
```

This confirms that the backdoor successfully executed the file download command — the attacker now has access to the target file's contents.

![Wireshark — TCP stream confirming "openfile on remote computers success"](../../img/vcspassport2024/image3.png)

### Phase 4: Data Exfiltration via Encoded Packets

Below the confirmation, a series of subsequent packets carry payloads filled with unusual character sequences. These are not standard protocol data — they contain printable characters arranged in patterns that are not immediately recognizable.

![Wireshark — Exfiltration packets containing encoded character data (part 1)](../../img/vcspassport2024/image4.png)

![Wireshark — Exfiltration packets containing encoded character data (part 2)](../../img/vcspassport2024/image5.png)

### Phase 5: Flag Recovery

All suspicious packet payloads are extracted and concatenated into a single text file. Upon viewing the combined output, the data reveals itself as **ASCII art** — stylized block characters spelling out the flag:

![Text editor — Extracted ASCII art revealing the flag: VCS{I_AM_LOSER}](../../img/vcspassport2024/image6.png)

The ASCII art clearly reads:

```
VCS{I_AM_LOSER}
```

---

## Flag

```
VCS{I_AM_LOSER}
```

---

## Intrusion Timeline Reconstruction

| Sequence | Activity | Evidence Source |
|---|---|---|
| T+0 | Attacker deploys `oci.bin` backdoor on victim host | Challenge artifacts |
| T+1 | C2 command sent via ICMP: `download C:\tmp\flag_1s_ck4mpj0n.txt` | ICMP Echo Request payload |
| T+2 | Backdoor confirms execution: `openfile on remote computers success` | TCP stream |
| T+3 | File contents exfiltrated as ASCII art across multiple ICMP/TCP packets | Packet payload analysis |

---

## Tools Used

| Tool | Purpose |
|---|---|
| Wireshark | PCAPNG analysis, protocol filtering, packet payload inspection |
| Text Editor | ASCII art reconstruction from extracted payloads |

---

## References

- MITRE ATT&CK: T1095, T1048.003, T1041, T1001
- ICMP Tunneling Techniques — Covert channel communication via ping protocol
