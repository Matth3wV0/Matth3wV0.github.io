# RE02 — Excel XLM Macro Analysis

## Case Overview

**Challenge:** RE02
**Category:** Reverse Engineering / Malware Analysis
**Event:** VCSPassport 2024
**Flag:** `VCS{MY_SUPERPOWER_IS_RICH}`

This investigation dissects a malicious Excel document (`RE02.xls`) containing an obfuscated XLM (Excel 4.0) macro. The macro's visible behavior — launching `calc.exe` — serves as a decoy, while the flag is concealed through a multi-cell string fragmentation and reversal obfuscation scheme. The analysis demonstrates why raw string extraction can be misleading and why specialized OLE analysis tools are essential for accurate deobfuscation.

---

## MITRE ATT&CK Mapping

| Technique ID | Name | Observed Activity |
|---|---|---|
| `T1059.005` | Command and Scripting Interpreter: Visual Basic | XLM (Excel 4.0) macro execution |
| `T1204.002` | User Execution: Malicious File | User opens infected Excel document |
| `T1027` | Obfuscated Files or Information | String reversal and multi-cell fragmentation |
| `T1140` | Deobfuscate/Decode Files or Information | Runtime string assembly from scattered cells |
| `T1036` | Masquerading | Decoy `calc.exe` execution to distract analyst |

---

## Forensic Analysis

### Phase 1: Initial Specimen Examination

The challenge provides a single artifact: `RE02.xls` — an older Excel binary format (.xls) file containing embedded macros.

Opening the file in Excel (Protected View) reveals a hint left by the challenge author:

> *"Tìm đoạn macro chạy calc, bạn sẽ thấy flag"*
> *(Find the macro that runs calc, you'll find the flag)*

This confirms the document contains a macro that executes `calc.exe`, and the flag is hidden somewhere within the macro's data structures.

![Excel Protected View — RE02.xls with challenge hint visible](../../img/vcspassport2024/image7.png)

### Phase 2: Static String Extraction

Running the `strings` command against the binary file to extract readable ASCII content:

```bash
strings RE02.xls
```

Several interesting artifacts surface in the output:

| String Found | Significance |
|---|---|
| `Flag in J123` | Indicates the flag formula resides in cell J123 |
| `{SCV` | Reversed fragment of `VCS{` |
| `MY_SUPERPOWER5` | Flag body — note the suspicious `5` character |
| `reverse string in B128 + D70 + reverse string in E178` | Assembly instruction for the flag |
| `}HCIR_SI_` | Reversed fragment of `_IS_RICH}` |

![Kali Linux terminal — strings output from RE02.xls highlighting key artifacts](../../img/vcspassport2024/image8.png)

### Phase 3: Manual Reconstruction Attempt (False Lead)

Based on the strings output, an initial reconstruction is attempted following the instruction `reverse string in B128 + D70 + reverse string in E178`:

1. **B128:** `{SCV` → reversed → `VCS{`
2. **D70:** `MY_SUPERPOWER5`
3. **E178:** `}HCIR_SI_` → reversed → `_IS_RICH}`

**Assembled result:** `VCS{MY_SUPERPOWER5_IS_RICH}`

This flag was submitted but **rejected** — the erroneous `5` character embedded in the raw strings output is a red herring. The `strings` command extracts raw bytes without understanding the OLE document structure, potentially concatenating adjacent cell values or capturing stale data from the binary stream.

### Phase 4: OLE Macro Analysis — The Breakthrough

The specialized tool `olevba` (from the `oletools` suite) is used to properly parse and deobfuscate the XLM macro:

```bash
olevba RE02.xls
```

![PowerShell — olevba output showing full XLM macro deobfuscation](../../img/vcspassport2024/image9.png)

The olevba output reveals the complete macro structure:

```
' RAW EXCEL4/XLM MACRO FORMULAS:
' SHEET: HaiNH45, Macrosheet
' CELL:K3, =HALT(), 1
' CELL:K2, =EXEC("calc"), 33.0
' CELL:J123, None, reverse string in B128 + D70 + reverse string in E178
' CELL:K1, None, Flag in J123
' CELL:E178, None, }HCIR_SI_
' CELL:D70, None, MY_SUPERPOWER
' CELL:B128, None, {SCV
```

The critical difference: **Cell D70 contains `MY_SUPERPOWER` — without the `5`**. The `5` found by `strings` was an artifact of the raw binary extraction, not the actual cell value.

**Correct reconstruction:**
1. **B128:** `{SCV` → reversed → `VCS{`
2. **D70:** `MY_SUPERPOWER`
3. **E178:** `}HCIR_SI_` → reversed → `_IS_RICH}`

**Assembled result:** `VCS{MY_SUPERPOWER_IS_RICH}`

---

## Flag

```
VCS{MY_SUPERPOWER_IS_RICH}
```

---

## Key Forensic Takeaways

| Lesson | Detail |
|---|---|
| **XLM ≠ VBA** | XLM (Excel 4.0) macros use a completely different storage format than modern VBA macros and require specialized tools |
| **`strings` can mislead** | Raw binary extraction does not respect OLE document boundaries — use `olevba` for accurate cell value extraction |
| **Decoy execution** | `=EXEC("calc")` distracts the analyst while the real payload is the obfuscated flag |
| **Cell fragmentation** | Splitting and reversing strings across scattered cells is an effective obfuscation technique in Excel-based malware |

---

## Tools Used

| Tool | Purpose |
|---|---|
| Excel (Protected View) | Safe initial specimen inspection |
| strings | Binary string extraction for preliminary triage |
| olevba (oletools) | XLM macro extraction, deobfuscation, and accurate cell value recovery |

---

## References

- MITRE ATT&CK: T1059.005, T1204.002, T1027, T1140, T1036
- oletools documentation — XLM macro analysis with olevba
