# FOR2 - ICMP Backdoor

> **CTF:** VCSPassport 2024  
> **Category:** Network Forensics  
> **Difficulty:** Medium  
> **Flag:** `VCS{I_AM_LOSER}`

---

## Executive Summary

This challenge demonstrates **covert command-and-control (C2) communication using ICMP protocol**. An attacker utilized ping packets to issue commands and exfiltrate sensitive data from a compromised system—a classic example of data exfiltration over alternative protocols that bypasses traditional firewall rules.

**Key Attack Techniques:**
- ICMP Tunneling for C2 communication
- Command execution via ping payload
- ASCII Art data exfiltration
- TCP stream data extraction

---

## Technical Analysis

### Phase 1: Traffic Overview

The challenge provides a PCAP file containing network traffic from a compromised system and an `oci.bin` backdoor binary.

Opening the PCAP in Wireshark and filtering by protocol reveals unusual **ICMP Echo Request/Reply** packets between `192.168.221.1` and `192.168.221.136`.

![ICMP Traffic Analysis](../../img/vcspassport2024/image1.png)

### Phase 2: ICMP Command Discovery

Examining individual ICMP packets reveals embedded ASCII data in the payload section. One critical packet contains:

```
download C:\tmp\flag_1s_ck4mpj0n.txt
```

This indicates the attacker is using ICMP packets to issue file download commands—a clear indicator of ICMP tunneling for C2.

![ICMP Command Packet](../../img/vcspassport2024/image2.png)

### Phase 3: TCP Stream Analysis

Following the ICMP command sequence, a TCP stream immediately afterwards contains:

```
openfile on remote computers success
```

This confirms the backdoor successfully executed the download command.

![TCP Confirmation](../../img/vcspassport2024/image3.png)

### Phase 4: Data Exfiltration

Subsequent TCP packets contain unusual character patterns. Analysis of the hexadecimal data reveals **ASCII art encoding**—the flag is hidden within the packet payloads in artistic text format.

![Encoded Data Packets](../../img/vcspassport2024/image4.png)
![Data Pattern Analysis](../../img/vcspassport2024/image5.png)

---

## The Breakthrough

Extracting all suspicious TCP packet data and concatenating the payloads reveals ASCII art spelling out the flag:

![Extracted ASCII Art Flag](../../img/vcspassport2024/image6.png)

```
██╗   ██╗ ██████╗███████╗██╗    ██╗      █████╗ ███╗   ███╗    ██╗      ██████╗ ███████╗███████╗██████╗
██║   ██║██╔════╝██╔════╝╚██╗  ██╔╝      ██╔══██╗████╗ ████║    ██║     ██╔═══██╗██╔════╝██╔════╝██╔══██╗
██║   ██║██║     ███████╗ ╚████╔╝ █████╗ ███████║██╔████╔██║    ██║     ██║   ██║███████╗█████╗  ██████╔╝
╚██╗ ██╔╝██║     ╚════██║  ╚██╔╝  ╚════╝ ██╔══██║██║╚██╔╝██║    ██║     ██║   ██║╚════██║██╔══╝  ██╔══██╗
 ╚████╔╝ ╚██████╗███████║   ██║          ██║  ██║██║ ╚═╝ ██║    ███████╗╚██████╔╝███████║███████╗██║  ██║
  ╚═══╝   ╚═════╝╚══════╝   ╚═╝          ╚═╝  ╚═╝╚═╝     ╚═╝    ╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
```

---

## Flag & Solution

```
VCS{I_AM_LOSER}
```

---

## Detection Strategy (Blue Team)

### SIEM/EDR Rules
```yaml
# Sigma Rule - Suspicious ICMP Data Payload
title: ICMP Tunnel Detection - Large Payload
logsource:
    product: network
detection:
    selection:
        protocol: ICMP
        data_length|gt: 100
    condition: selection
    
# Sigma Rule - ASCII in ICMP
title: ICMP Packet with ASCII Command Strings
detection:
    selection:
        protocol: ICMP
        payload|contains:
            - 'download'
            - 'upload'
            - 'execute'
            - 'openfile'
    condition: selection
```

### Network Indicators
- **Unusual ICMP packet sizes** (standard ping is ~64 bytes)
- **High frequency ICMP traffic** to single destination
- **Printable ASCII characters** in ICMP data payload
- **Sequential ICMP → TCP patterns** indicating command execution

### Snort/Suricata Rules
```
alert icmp any any -> any any (msg:"ICMP Tunnel - Command Detected"; 
    content:"download"; nocase; sid:1000001; rev:1;)
    
alert icmp any any -> any any (msg:"ICMP Tunnel - Large Payload"; 
    dsize:>100; sid:1000002; rev:1;)
```

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1095** | Non-Application Layer Protocol | ICMP used for C2 communication |
| **T1071.001** | Application Layer Protocol: Web | TCP for file data transfer |
| **T1048.003** | Exfiltration Over Alternative Protocol | Data hidden in ICMP packets |
| **T1041** | Exfiltration Over C2 Channel | Flag file extracted via tunnel |
| **T1001** | Data Obfuscation | ASCII art encoding |

---

## Tools Used

- **Wireshark** - PCAP analysis and packet inspection
- **tshark** - Command-line packet extraction
- **Text Editor** - ASCII art reconstruction
