# tet-riffic!

> **CTF:** niteCTF 2024  
> **Category:** Forensics / Miscellaneous  
> **Difficulty:** Medium  
> **Flag:** `nite{mayb3_th3_r3al_tetr15_wa5_qrc0d3s_we_mad3_a10ng_th3_way}`

---

## Executive Summary

This challenge combines **USB traffic forensics** with **game mechanics analysis** to reconstruct a hidden QR code. The solution involves extracting USB HID keyboard data from a PCAP file, replaying the keystrokes in a modified Tetris game, and reconstructing a partial QR code using error correction techniques.

**Key Techniques:**
- USB HID Protocol Analysis
- Keystroke Extraction and Replay
- Deterministic Game Analysis
- QR Code Reconstruction

---

## Technical Analysis

### Phase 1: Challenge Files

The challenge provides:
- `tetris.pcapng` - USB traffic capture
- `tetris.py` - Python Tetris game implementation

### Phase 2: Game Analysis

Examining `tetris.py` reveals **predetermined block sequences**:

```python
pre_blocks = [(0,1), (4,1), (0,2), (6,1), (7,2), (5,1), (3,2), ...]

def new_figure(self, counter):
    a, b = pre_blocks[b_counter]
    self.figure = Figure(a, b)
```

**Critical Finding:** Blocks are NOT randomly generated—they follow a fixed sequence. This suggests the game itself encodes hidden data.

### Phase 3: USB HID Analysis

The PCAP file contains USB HID (Human Interface Device) data—keyboard input recordings. The captured keystrokes correspond to Tetris controls:
- `W` - Rotate
- `A` - Move left
- `S` - Move down
- `D` - Move right
- `Space` - Drop

### Phase 4: Keystroke Extraction

Using `tshark` to extract HID data:

```bash
tshark -r tetris.pcapng -Y "usbhid.data" -T fields -e usbhid.data > keystrokes.txt
```

A modified USB keyboard parser decoded the raw HID data:

```python
for buffer in output:
    if buffer[:2] in ["02", "20"]:  # Shift modifier detection
        keycode = "0x" + buffer[6:8].upper()
        if keycode in usb_codes:
            message.append(usb_codes[keycode])
```

### Phase 5: Keystroke Replay

The extracted keystrokes were injected into the Tetris game:

```python
keystrokes = "WAAAAAAAAAAAAAAA AAAAAAAAAAAAWWW AAAAAAAAA..."
cursor = 0

while not done:
    if cursor < len(keystrokes):
        current_key = keystrokes[cursor].lower()
        if current_key == 'w':
            game.rotate()
        elif current_key == 'a':
            game.go_side(-1)
        # ... handle all keys
        cursor += 1
```

---

## The Breakthrough

### Partial QR Code Discovery

Running the modified game with replayed keystrokes generated a **recognizable QR code pattern** formed by the Tetris blocks.

However, the QR code was incomplete due to game constraints. The visible portions included:
- Three finder patterns (corner squares)
- Timing patterns
- Partial data modules

### QR Reconstruction

Using **QR code error correction theory**:
1. QR codes can be read even when partially damaged
2. Finder patterns and timing patterns are essential
3. Missing data can be recovered through Reed-Solomon encoding

**Manual reconstruction in Excel:**
- Mapped visible blocks to a grid
- Added missing finder patterns where needed
- Ensured proper alignment

**Using QRazyBox:**
- Imported the reconstructed QR image
- Applied error correction algorithms
- Successfully decoded the partial QR code

---

## Flag & Solution

```
nite{mayb3_th3_r3al_tetr15_wa5_qrc0d3s_we_mad3_a10ng_th3_way}
```

---

## Detection Strategy (Blue Team)

### USB Forensics Indicators
- **Unusual USB HID patterns** - Automated input sequences
- **Keystroke timing analysis** - Inhuman input speeds
- **USB device fingerprinting** - Suspicious device classes

### Network Analysis
```bash
# Extract USB keyboard data
tshark -r capture.pcapng -Y "usb.transfer_type == 1 && usb.endpoint_address == 0x81"

# Identify HID devices
tshark -r capture.pcapng -Y "usb.bInterfaceClass == 0x03"
```

### Behavioral Indicators
- Applications receiving input faster than human capability
- Repeated precise input sequences
- Game/application modifications to accept scripted input

---

## MITRE ATT&CK Mapping

| Technique ID | Technique Name | Description |
|-------------|----------------|-------------|
| **T1056.001** | Input Capture: Keylogging | USB HID keystroke recording |
| **T1200** | Hardware Additions | USB device data capture |
| **T1001.002** | Data Obfuscation: Steganography | Data hidden in game patterns |

---

## Tools Used

- **Wireshark/tshark** - USB packet analysis
- **Python** - Keystroke parsing and game modification
- **Excel** - QR code reconstruction
- **QRazyBox** - Partial QR code decoding
- **USB Keyboard Parser** - HID data interpretation

---

## Key Takeaways

1. **Deterministic behavior** in games often indicates hidden data
2. **USB HID analysis** can reveal user input patterns
3. **QR codes are resilient** - Partial codes can still be decoded
4. **Cross-domain analysis** (network + application) reveals hidden layers
