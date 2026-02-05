# RE02 - Excel Macro Malware

> **CTF:** VCSPassport 2024  
> **Category:** Reverse Engineering / Malware Analysis  
> **Difficulty:** Medium  
> **Flag:** `VCS{MY_SUPERPOWER_IS_RICH}`

---

## Executive Summary

This challenge involves analyzing an **obfuscated XLM (Excel 4.0) macro** embedded in a malicious Excel document. Unlike modern VBA macros, XLM macros are stored differently and require specialized tools for analysis. The macro was designed to launch calculator as a decoy while hiding the flag through string manipulation across multiple spreadsheet cells.

**Key Attack Techniques:**
- XLM Macro Obfuscation
- Multi-cell String Fragmentation
- String Reversal Obfuscation
- Decoy Execution (calc.exe)

---

## Technical Analysis

### Phase 1: Initial Reconnaissance

The challenge provides a single file: `RE02.xls`, an older Excel format with embedded macros.

![Excel Document](../../img/vcspassport2024/image7.png)

Opening the file shows a hint: "Tìm đoạn macro chạy calc, bạn sẽ thấy flag" (Find the macro that runs calc, you'll find the flag).

### Phase 2: Strings Analysis

Running the `strings` command on the Excel file reveals interesting data:

```bash
strings RE02.xls | grep -i flag
```

![Strings Output](../../img/vcspassport2024/image8.png)

Key findings:
- `Flag in J123`
- `MY_SUPERPOWER5`
- `reverse string in B128 + D70 + reverse string in E178`
- `}HCIR_SI_`

This suggests the flag is constructed by combining and reversing strings from cells B128, D70, and E178.

### Phase 3: Manual Reconstruction Attempt

Initial attempt to reconstruct the flag based on strings output:
- Cell B128: `{SCV` → reversed: `VCS{`
- Cell D70: `MY_SUPERPOWER`
- Cell E178: `}HCIR_SI_` → reversed: `_IS_RICH}`

**Result:** `VCS{MY_SUPERPOWER5_IS_RICH}`

However, this flag was **incorrect** (note the extra "5").

---

## The Breakthrough

### olevba Analysis

The `olevba` tool provides proper deobfuscation of XLM macros:

```bash
olevba RE02.xls
```

![olevba Analysis](../../img/vcspassport2024/image9.png)

**olevba Output:**
```
FILE: D:\CTF\VCSPassport 2024\RE02\RE02.xls
Type: OLE

VBA MACRO xlm_macro.txt
in file: xlm_macro - OLE stream: 'xlm_macro'

' RAW EXCEL4/XLM MACRO FORMULAS:
' SHEET: HaiNH45, Macrosheet
' CELL:K3, =HALT(), 1
' CELL:K2, =EXEC("calc"), 33.0
' CELL:J123, None, reverse string in B128 + D70 + reverse string in E178
' CELL:K1, None, Flag in J123
' CELL:E178, None, }HCIR_SI_
' CELL:D70, None, MY_SUPERPOWER
' CELL:B128, None, {SCV

' EMULATION - DEOBFUSCATED EXCEL4/XLM MACRO FORMULAS:
' CELL:K2   , PartialEvaluation  , =EXEC("calc")
' CELL:K3   , End                , HALT()

+----------+---------------+------------------------------------------+
|Type      |Keyword        |Description                                |
+----------+---------------+------------------------------------------+
|Suspicious|EXEC           |May run an executable file or a system    |
|          |               |command using Excel 4 Macros (XLM/XLF)    |
|Suspicious|Base64 Strings |Base64-encoded strings were detected      |
|Suspicious|XLM macro      |XLM macro found. It may contain malicious |
|          |               |code                                       |
+----------+---------------+------------------------------------------+
```

The key insight: olevba showed the actual cell values without the erroneous "5" character that was present in the raw strings output.

**Correct reconstruction:**
- B128 reversed: `VCS{`
- D70: `MY_SUPERPOWER`
- E178 reversed: `_IS_RICH}`

---

## Flag & Solution

```
VCS{MY_SUPERPOWER_IS_RICH}
```

---

## Detection Strategy (Blue Team)

### SIEM/EDR Rules
```yaml
# Sigma Rule - XLM Macro Detection
title: Excel Document with XLM Macro Sheet
logsource:
    product: windows
    category: file_access
detection:
    selection:
        TargetFilename|endswith:
            - '.xls'
            - '.xlm'
        OLEStreams|contains: 'xlm_macro'
    condition: selection

# Sigma Rule - Excel EXEC Function
title: Excel 4.0 Macro EXEC Execution
detection:
    selection:
        ParentImage|endswith: 'EXCEL.EXE'
        CommandLine|contains:
            - 'cmd.exe'
            - 'powershell'
            - 'wscript'
            - 'calc.exe'
    condition: selection
```

### Static Analysis Indicators
```bash
# Quick XLM macro detection
olevba --decode <file.xls> | grep -E "(EXEC|CALL|REGISTER)"

# Check for suspicious OLE streams
oleid <file.xls>
```

### Behavioral Indicators
- Excel spawning child processes (especially cmd, powershell, calc)
- Excel opening files outside standard document paths
- Network connections from Excel process
- Large number of hidden sheets in workbook

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1059.005** | Command and Scripting Interpreter: Visual Basic | XLM macro execution |
| **T1204.002** | User Execution: Malicious File | User opens infected Excel document |
| **T1027** | Obfuscated Files or Information | String reversal & cell fragmentation |
| **T1140** | Deobfuscate/Decode Files or Information | Runtime string assembly |
| **T1036** | Masquerading | Decoy calc.exe execution |

---

## Tools Used

- **olevba** (oletools) - XLM macro extraction and deobfuscation
- **strings** - Binary string extraction
- **oleid** - OLE file analysis
- **Excel** (Protected View) - Document inspection

---

## Key Takeaways

1. **XLM macros ≠ VBA macros** - Different storage format requires specialized tools
2. **strings output can be misleading** - Use olevba for accurate deobfuscation
3. **Decoy execution** is a common technique to distract analysts
4. **Cell fragmentation** is an effective obfuscation technique in Excel malware
