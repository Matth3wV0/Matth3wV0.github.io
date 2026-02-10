---
id: ezlogic
title: "EzLogic"
description: "Hardware logic reverse engineering with Verilog signal analysis"
category: reverse
event: "0CTF 2024"
flag: "0ops{aadc337c-b5a0-4ff0-ad94-9d1cf41956f4}"
mitre:
  - id: "T1027"
    name: "Obfuscated Files or Information"
    desc: "Custom logic encoding"
  - id: "T1140"
    name: "Deobfuscate/Decode"
    desc: "Position-based decryption"
order: 1
---

## 📋 Executive Summary

Hardware security challenge involving analysis of a custom logic gate circuit described in Verilog. The challenge required understanding digital logic, position-based encoding, and character-by-character brute-forcing to recover the flag.

## 🔍 Technical Analysis

Analyzing and decoding a hardware logic system described in `schematic.pdf`.

![EzLogic schematic analysis](../../assets/img/ctf_dl/ezlogic/5c0d4364-f1d4-492c-8947-cd672b0a5f88.png)

Based on the information from `EzLogic_tb.vcd`, we can observe that `data_out_all` changes over time, and the variable `success=0`. If the `success` variable becomes `1`, we might be able to find the flag.

![VCD analysis 1](../../assets/img/ctf_dl/ezlogic/f328be2e-3197-4863-bfd3-02f67e1090dc.png)
![VCD analysis 2](../../assets/img/ctf_dl/ezlogic/6552cef5-ee8f-4a64-8e0a-b6fad5c3ea52.png)

## 💡 The Breakthrough

After replacing the value of `FLAG_TO_TEST` with `"0ops{....."`, I noticed that the first 10 bytes of `data_out_all` matched with `data_std`. This indicates that the program encodes each character individually, and the encoding varies depending on the position.

![Flag prefix discovery](../../assets/img/ctf_dl/ezlogic/a1e3f630-821c-47de-84c5-f29d0a054352.png)

I came up with the idea of using brute force to find the flag by replacing each character of the flag sequentially and comparing the corresponding byte at that position in `data_std`.

```python
def brute_force_flag():
    current_flag = flag_prefix  # Start with the known prefix
    data_std = ["30", "78", "9d", "56", ...]  # Expected hex values
    
    for i in range(len(flag_prefix), flag_length):
        for char in characters:
            test_flag = current_flag + char + "0" * (flag_length - len(current_flag) - 1)
            update_testbench(test_flag)
            data_out = get_data_out()
            
            if data_out[i] == data_std[i]:
                current_flag += char
                break
    
    print(f"Final flag: {current_flag}")
```

After running the brute-force program, we were able to find the flag.

![Flag found](../../assets/img/ctf_dl/ezlogic/48547161-02b8-4d81-b9b5-27b62425cb3c.png)

## 🛡️ Detection Strategy (Blue Team)

- Monitor for automated Verilog testbench modifications
- Detect brute-force patterns in simulation outputs
- Log VCD file access patterns for anomaly detection
