# m00nwalk

> **CTF:** picoCTF  
> **Category:** Forensics / Signal Analysis  
> **Difficulty:** Medium  
> **Flag:** `picoCTF{beep_boop_im_in_space}`

---

## Executive Summary

This challenge demonstrates **SSTV (Slow Scan Television) signal decoding**—a technique historically used to transmit images via radio, notably during Apollo lunar missions. The flag is encoded as an SSTV signal within a WAV audio file.

**Key Techniques:**
- Audio Signal Classification
- SSTV Protocol Recognition
- Signal-to-Image Decoding

---

## Technical Analysis

### Phase 1: Initial Assessment

The challenge provides a `.wav` audio file. Playing the audio reveals characteristic tones suggesting an encoded signal rather than natural audio.

### Phase 2: Visualization Attempt

Initial analysis with **Sonic Visualiser**:
- Spectrogram shows unusual frequency patterns
- No visible text or obvious steganography
- Patterns suggest modulated signal encoding

### Phase 3: Signal Research

The unique audio characteristics and challenge name "m00nwalk" hint at space-related technology. Research revealed:

**SSTV (Slow Scan Television):**
- Used by amateur radio operators
- Transmits static images via audio
- Employed in Apollo missions for lunar image transmission
- Various modes: Scottie, Martin, Robot, etc.

---

## The Breakthrough

Using an SSTV decoder application:

**Linux:**
```bash
qsstv  # Load WAV file and decode
```

**Windows:**
- RX-SSTV
- MMSSTV

**Online:**
- Web-based SSTV decoders

The decoder converted the audio signal into an image containing the flag.

---

## Flag & Solution

```
picoCTF{beep_boop_im_in_space}
```

---

## Detection Strategy (Blue Team)

### Audio Signal Classification
- **SSTV signatures:** 1200 Hz VIS code at transmission start
- **Frequency patterns:** Specific to SSTV modes
- **Duration:** Images take 8-120 seconds to transmit

### Analysis Tools
```bash
# Spectral analysis
sox input.wav -n spectrogram

# Audio format identification
file input.wav
mediainfo input.wav
```

### Covert Channel Indicators
- Audio files with unusual spectral characteristics
- WAV files with frequencies outside human speech range
- Audio files in unexpected data transfers

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1027** | Obfuscated Files or Information | Image encoded as audio |
| **T1001.003** | Data Obfuscation: Steganography | SSTV concealment technique |
| **T1048** | Exfiltration Over Alternative Protocol | Data in audio format |

---

## Tools Used

- **QSSTV** - Linux SSTV decoder
- **RX-SSTV** - Windows SSTV decoder
- **Sonic Visualiser** - Audio visualization
- **Audacity** - Audio analysis

---

## Historical Context

SSTV was developed in the 1950s-60s for transmitting images over radio frequencies. During the Apollo 11 mission, SSTV was used to transmit the first images from the moon's surface—making "m00nwalk" an appropriate challenge name.

### Common SSTV Modes
| Mode | Resolution | Time |
|------|------------|------|
| Scottie 1 | 320×256 | 110s |
| Martin 1 | 320×256 | 114s |
| Robot 36 | 320×240 | 36s |
