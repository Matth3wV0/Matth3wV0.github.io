# St3g0

> **CTF:** picoCTF  
> **Category:** Forensics / Steganography  
> **Difficulty:** Easy  
> **Flag:** `picoCTF{7h3r3_15_n0_5p00n_a1062667}`

---

## Executive Summary

This challenge demonstrates **LSB (Least Significant Bit) steganography** in PNG images. Data is hidden by modifying the least significant bits of pixel values—changes imperceptible to the human eye but extractable with appropriate tools.

**Key Techniques:**
- PNG File Analysis
- LSB Steganography Detection
- zsteg Tool Usage

---

## Technical Analysis

### Phase 1: File Identification

The challenge provides a PNG image file. Standard image viewing reveals no visible anomalies.

### Phase 2: Steganography Detection

For PNG files, common steganography techniques include:
- **LSB encoding** - Data in pixel bit planes
- **Palette manipulation** - Data in color table
- **Chunk embedding** - Data in PNG metadata chunks

### Phase 3: Tool Selection

**zsteg** is the optimal tool for PNG LSB analysis:
- Automatically scans all bit planes
- Detects multiple encoding schemes
- Fast and comprehensive

---

## The Breakthrough

Running zsteg on the image:

```bash
zsteg pico.png
```

**Output:**
```
b1,r,lsb,xy         .. text: "picoCTF{7h3r3_15_n0_5p00n_a1062667}"
```

The flag was hidden in the **least significant bit of the red channel**, read in left-to-right, top-to-bottom order.

---

## Flag & Solution

```
picoCTF{7h3r3_15_n0_5p00n_a1062667}
```

---

## Detection Strategy (Blue Team)

### Static Analysis
```bash
# Quick LSB scan
zsteg image.png

# Detailed analysis
zsteg -a image.png

# PNG chunk analysis
pngcheck -v image.png
```

### Indicators of LSB Steganography
- **Statistical anomalies** in pixel distribution
- **Unusual entropy** in specific color channels
- **Regular patterns** in LSB data

### SIEM Considerations
- Monitor for image files in unusual contexts
- Flag image files with suspicious metadata
- Analyze images in data exfiltration investigations

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1027** | Obfuscated Files or Information | Data hidden in image pixels |
| **T1001.002** | Data Obfuscation: Steganography | LSB encoding technique |

---

## Tools Used

- **zsteg** - PNG/BMP steganography detection
- **pngcheck** - PNG file validation
- **file** - File type identification
