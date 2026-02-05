# Verify

> **CTF:** picoCTF  
> **Category:** General Skills / Forensics  
> **Difficulty:** Easy  
> **Flag:** `picoCTF{trust_but_verify_8eee7195}`

---

## Executive Summary

This challenge focuses on **file integrity verification using cryptographic hashes**. Given a directory of files and a target SHA-256 hash, the task is to identify which file matches the checksum—a fundamental skill in digital forensics and incident response.

**Key Techniques:**
- SHA-256 Hash Computation
- Batch File Processing
- Hash Comparison Automation

---

## Technical Analysis

### Phase 1: Challenge Overview

The challenge provides:
- A directory containing multiple files
- A target SHA-256 hash value
- A `decrypt.sh` script for flag extraction

### Phase 2: Hash Computation Strategy

Manual hash checking of each file would be time-consuming. An automated approach is more efficient:

```python
import hashlib
import os

target_hash = "<provided_sha256_hash>"
directory = "./files"

for filename in os.listdir(directory):
    filepath = os.path.join(directory, filename)
    with open(filepath, 'rb') as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()
    
    if file_hash == target_hash:
        print(f"Match found: {filename}")
        break
```

Alternatively, using command-line tools:

```bash
sha256sum files/* | grep "<target_hash>"
```

---

## The Breakthrough

The automated script identified file `8eee7195` as matching the target hash.

Running the provided decryption script:

```bash
./decrypt.sh 8eee7195
```

This revealed the flag.

---

## Flag & Solution

```
picoCTF{trust_but_verify_8eee7195}
```

---

## Detection Strategy (Blue Team)

### File Integrity Monitoring
```yaml
# Sigma Rule - Hash Verification Activity
title: Mass File Hash Computation
logsource:
    product: linux
    category: process_creation
detection:
    selection:
        CommandLine|contains:
            - 'sha256sum'
            - 'md5sum'
            - 'sha1sum'
    condition: selection
```

### Use Cases for Hash Verification
- **Malware analysis** - Known bad file identification
- **Incident response** - File integrity verification
- **Compliance** - Configuration drift detection
- **Evidence handling** - Chain of custody verification

### Best Practices
- Maintain hash databases (NSRL, VirusTotal)
- Use multiple hash algorithms (SHA-256 + MD5)
- Document hash verification in investigation reports

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1027** | Obfuscated Files or Information | Finding specific file among many |
| **T1083** | File and Directory Discovery | Iterating through file system |

---

## Tools Used

- **sha256sum** - Linux hash computation
- **Python hashlib** - Programmatic hashing
- **Bash scripting** - Automation
