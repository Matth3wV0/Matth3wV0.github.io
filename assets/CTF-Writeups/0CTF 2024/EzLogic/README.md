# EzLogic

> **CTF:** 0CTF 2024  
> **Category:** Reverse Engineering / Hardware Logic  
> **Difficulty:** Hard  
> **Flag:** `0ops{aadc337c-b5a0-4ff0-ad94-9d1cf41956f4}`

---

## Executive Summary

This challenge involves **reverse engineering a hardware logic system** defined in Verilog. The system implements a position-dependent character encoding scheme that transforms input characters into obfuscated output. The solution requires understanding the encoding mechanism and developing a brute-force approach to recover the original flag character by character.

**Key Techniques:**
- Verilog Hardware Analysis
- Signal Tracing and Waveform Analysis
- Position-Dependent Encoding Understanding
- Character-by-Character Brute Force

---

## Technical Analysis

### Phase 1: Challenge Overview

The challenge provides:
- `schematic.pdf` - Gate-level circuit diagram
- `EzLogic_tb.vcd` - Waveform simulation data
- `EzLogic_tb.v` - Verilog testbench
- `EzLogic_top_synth.v` - Synthesized logic module

### Phase 2: Waveform Analysis

Opening `EzLogic_tb.vcd` reveals:
- `data_out_all` - Changes over time during simulation
- `success` - Remains at **0** throughout

**Hypothesis:** Achieving `success=1` requires finding the correct input that produces the expected output.

### Phase 3: Testbench Analysis

```verilog
module EzLogic_tb #(
    parameter FLAG_TO_TEST = "..........................................",
    parameter N = 42
)();
    // ...
    wire [0:8*N-1] data_std = 'h30789d5692f2fe23bb2c5d9e16406653b6cb217c952998ce17b7143788d949952680b4bce4c30a96c753;
    assign success = (data_std == data_out_all);
```

**Key Observations:**
- Flag length: **42 characters**
- Target output: `data_std` (hex-encoded)
- Success condition: Encoded input must match `data_std`

### Phase 4: Encoding Discovery

Testing with known flag prefix `0ops{`:

```verilog
parameter FLAG_TO_TEST = "0ops{....................................."
```

After recompiling and examining `data_out_all`, the first 10 bytes matched `data_std`.

**Critical Insight:** Each character is encoded **independently** based on its position. This enables a character-by-character brute-force approach.

---

## The Breakthrough

### Brute-Force Strategy

For each position `i` in the flag:
1. Test each printable character
2. Compile the modified testbench
3. Compare `data_out[i]` with `data_std[i]`
4. If match found, proceed to next position

### Implementation

```python
import subprocess

flag_prefix = "0ops{"
flag_length = 42
characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&'()*+,-./:;<=>?@[]^_`{|}~"

data_std = [
    "30", "78", "9d", "56", "92", "f2", "fe", "23", "bb", "2c", "5d", "9e",
    "16", "40", "66", "53", "b6", "cb", "21", "7c", "95", "29", "98", "ce",
    "17", "b7", "14", "37", "88", "d9", "49", "95", "26", "80", "b4", "bc",
    "e4", "c3", "0a", "96", "c7", "53"
]

def brute_force_flag():
    current_flag = flag_prefix
    
    for i in range(len(flag_prefix), flag_length):
        for char in characters:
            test_flag = current_flag + char + "0" * (flag_length - len(current_flag) - 1)
            update_testbench(test_flag)
            data_out = run_simulation()
            
            if data_out[i] == data_std[i]:
                current_flag += char
                print(f"Position {i}: '{char}' -> {current_flag}")
                break
    
    print(f"Final flag: {current_flag}")
```

**Testbench Modification:**
```verilog
// Added for output extraction
$display("Final data_out: %h", data_out);
```

### Execution Result

After iterating through all 42 positions, the brute-force successfully recovered the complete flag.

---

## Flag & Solution

```
0ops{aadc337c-b5a0-4ff0-ad94-9d1cf41956f4}
```

---

## Detection Strategy (Blue Team)

*This challenge represents hardware logic analysis rather than an attack technique. However, understanding hardware obfuscation is valuable for:*

- **Hardware Trojan Detection** - Identifying malicious modifications in synthesized logic
- **IP Protection** - Understanding how gates can obscure functionality
- **Side-Channel Analysis** - Correlating signal outputs with inputs

### Reverse Engineering Countermeasures
- Logic locking mechanisms
- Camouflaged gates
- Dynamic obfuscation based on key inputs

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1027** | Obfuscated Files or Information | Position-dependent encoding obscures data |
| **T1140** | Deobfuscate/Decode Files | Brute-force decoding of encoded data |

---

## Tools Used

- **Icarus Verilog (iverilog)** - Verilog simulation
- **GTKWave** - VCD waveform visualization
- **Python** - Brute-force automation
- **PDF Viewer** - Schematic analysis
