# DF 200 - Known Unknowns

> **CTF:** UWSP Pointer Overflow CTF 2024  
> **Category:** Audio Forensics / Steganography  
> **Difficulty:** 200 points  
> **Flag:** *(Visible in spectrogram)*

---

## Executive Summary

This challenge demonstrates **audio steganography** using spectral encoding. The flag is hidden within the **frequency spectrum** of a WAV audio file and becomes visible when rendered as a spectrogram—a classic technique for embedding visual data in audio signals.

**Key Techniques:**
- Audio Signal Analysis
- Spectrogram Visualization
- Frequency-Domain Steganography

---

## Technical Analysis

### Phase 1: Initial Assessment

The challenge provides a `.wav` audio file. Playing the audio reveals nothing immediately recognizable—suggesting steganographic content.

### Phase 2: Audio Visualization

Tools considered for audio analysis:
- **Sonic Visualiser** - Comprehensive audio visualization
- **Audacity** - Basic spectrogram view
- **WXtoImg** - SSTV decoding (if applicable)

Opening the file in **Sonic Visualiser** and adding a spectrogram layer:

```
Layer → Add Spectrogram
```

### Phase 3: Spectrogram Analysis

The spectrogram view immediately revealed **text embedded in the frequency spectrum**. The flag was visually encoded as patterns within specific frequency bands.

---

## The Breakthrough

The spectrogram visualization clearly displayed the flag text embedded in the audio's frequency domain. This technique works by modulating specific frequency bands to create visual patterns when viewed as a spectrogram.

---

## Flag & Solution

The flag was visible directly in the spectrogram output.

---

## Detection Strategy (Blue Team)

### Audio Steganography Indicators
- **Unusual frequency patterns** in audio files
- **Non-natural audio characteristics** in benign-looking files
- **High-frequency content** in files that shouldn't have it

### Analysis Tools
```bash
# Quick spectrogram generation
sox input.wav -n spectrogram -o spectrogram.png

# FFT analysis
ffmpeg -i input.wav -lavfi showspectrum output.png
```

### SIEM Considerations
- Monitor for unusual audio file transfers
- Flag audio files in suspicious contexts (email attachments, web uploads)
- Scan audio files in security-sensitive environments

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1027** | Obfuscated Files or Information | Data hidden in audio spectrum |
| **T1001.003** | Data Obfuscation: Steganography | Visual data in audio file |

---

## Tools Used

- **Sonic Visualiser** - Audio visualization and spectrogram analysis
- **Audacity** - Alternative audio analysis tool
- **SoX** - Command-line audio processing

---

## Educational Notes

### How Spectrogram Steganography Works

1. **Encoding:** Image/text is converted to frequency data
2. **Modulation:** Specific frequencies are amplified to represent pixels
3. **Visualization:** When viewed as spectrogram, the pattern appears

### Common Carrier Formats
- WAV (uncompressed - preserves data)
- FLAC (lossless - preserves data)
- MP3 (lossy - may degrade hidden content)
