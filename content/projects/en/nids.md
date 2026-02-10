---
id: nids
title: "Hybrid NIDS"
description: "An advanced hybrid NIDS combining Suricata signature-based detection with Machine Learning anomaly detection. Trained on CICIDS2017 with XGBoost achieving 99.46% accuracy. Features 8-step closed-loop detection, behavioral analysis, and real-time Telegram alerting."
category: security
icon: shield-check
color: green
tags:
  - "ELK Stack"
  - "Machine Learning"
  - "MITRE ATT&CK"
  - "Python"
stats:
  - value: "99.46%"
    label: "Detection Accuracy"
  - value: "< 2s"
    label: "Response Time"
hasModal: true
span: 2
github: "https://github.com/Matth3wV0/A-Suricata-and-Machine-Learning-Based-Hybrid-Network-Intrusion-Detection-System"
order: 1
---

## 📋 Executive Summary

A state-of-the-art hybrid Network Intrusion Detection System combining Suricata signature-based detection with Machine Learning anomaly detection (Decision Tree, Random Forest, XGBoost). Trained on the CICIDS2017 dataset with 99.46% accuracy, featuring real-time alerting via Telegram API and comprehensive behavioral analysis.

## 🔄 System Workflow

The system operates through an 8-step closed-loop process to ensure no threats are missed:

1. **Baseline Establishment:** Normal network traffic data trains the ML model, creating behavioral thresholds.
2. **Sniffing:** High-speed packet capture connects to SPAN port without network latency.
3. **Signature Analysis (SNIDS):** Suricata inspects packets against known signature rules.
4. **Immediate Alerting:** Known attacks trigger instant alerts upon signature match.
5. **Forward to ADNIDS:** Unmatched packets are forwarded to the ML-based anomaly detection component.
6. **ML Analysis:** ADNIDS compares packet characteristics against the established baseline.
7. **Anomaly Alerting:** Significant deviations trigger zero-day attack alerts.
8. **System Update:** Newly discovered attack patterns are fed back to enhance signature database.

## 🤖 AI Engineer Responsibilities

| Area | Task | Technical Detail |
|------|------|------------------|
| Data Preprocessing | CICIDS2017 Dataset | 2.2M benign + 557k attack samples, balanced & cleaned |
| Feature Engineering | 78 → 9 Features | Removed constant/correlated features, mapped to Suricata logs |
| Model Training | Ensemble ML | DT (20%) + RF (30%) + XGBoost (50%) weighted voting |
| Integration | Real-time Pipeline | Suricata eve.json → Feature Extraction → ML Inference |

## 🏗️ System Architecture

The system consists of multiple layers working in harmony:

```plaintext
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA INGESTION LAYER                             │
│  Suricata eve.json → JSON Parser → Session Manager                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FEATURE EXTRACTION LAYER                         │
│  • dest_port, duration, total_fwd/bwd_packets, total_fwd/bwd_bytes  │
│  • flow_bytes_per_sec, flow_packets_per_sec, down_up_ratio          │
│  • HTTP, DNS, TLS, SSH application layer features                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DETECTION LAYER                                  │
│  ┌────────────────────────┐  ┌────────────────────────────────────┐ │
│  │   ML ANOMALY DETECTOR  │  │   STATISTICAL ANOMALY DETECTOR     │ │
│  │DT(20%)+RF(30%)+XGB(50%)│  │  Z-Score (>4.0) + IQR Outliers     │ │
│  │   Voting: ≥2/3 models  │  │  Feature-weighted Scoring          │ │
│  └────────────────────────┘  └────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BEHAVIORAL ANALYSIS LAYER                        │
│  Port Scan | Host Scan | Brute Force | Volume Anomaly Detection     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ALERT SYSTEM                                │
│  Console Logging | File Logging | Telegram Notifications | CSV      │
└─────────────────────────────────────────────────────────────────────┘
```

## 📊 Machine Learning Models

Three complementary ML algorithms form an ensemble for robust detection:

| Model | Accuracy | Weight | Role |
|-------|----------|--------|------|
| Decision Tree | 99.19% | 20% | Fast baseline detection |
| Random Forest | 99.38% | 30% | Balanced precision/recall |
| XGBoost | 99.46% | 50% | Primary detector, tuned via GridSearchCV |

## 🔧 Core Features (9 Selected)

```python
ALIGNED_FEATURES = [
    "dest_port",           # Destination Port
    "duration",            # Flow Duration
    "total_fwd_packets",   # Total Forward Packets
    "total_bwd_packets",   # Total Backward Packets
    "total_fwd_bytes",     # Total Forward Bytes
    "total_bwd_bytes",     # Total Backward Bytes
    "flow_bytes_per_sec",  # Derived: bytes/duration
    "flow_packets_per_sec",# Derived: packets/duration
    "down_up_ratio"        # Derived: bwd_bytes/fwd_bytes
]
```

## 🎯 Behavioral Attack Detection

| Attack Type | Detection Logic | Threshold |
|-------------|-----------------|-----------|
| Port Scan | `ports_in_window / ips_in_window > 10` | score > 0.7 |
| Host Scan | `ips_in_window / ports_in_window > 5` | score > 0.7 |
| Brute Force | `auth_failures to same service > 3` | score > 0.7 |
| Volume Anomaly | `bytes/sec > 1MB OR packets/sec > 1000` | score > 0.7 |

## 🚨 Intelligent Alert System

Beyond simple anomaly detection, the system provides comprehensive analysis:

- **Combined Anomaly Score:** Weighted aggregation from all 3 ML models for confidence scoring.
- **Statistical Anomalies:** Z-score analysis pinpoints exact features (e.g., `total_bwd_packets`) deviating from baseline.
- **Severity Classification:** Auto-categorizes alerts (Low/Medium/High) based on model confidence and protocol context (SSH, HTTPS).
- **Real-time Telegram Notifications:** Instant alerts with full attack context for SOC operators.

## 🛠️ Technology Stack

- **Language:** Python 3 (AI/ML optimized)
- **ML Libraries:** Scikit-learn, XGBoost, Pandas, Numpy
- **IDS Engine:** Suricata (eve.json log parser)
- **Alerting:** Telegram Bot API, File Logging, CSV Export
- **Dataset:** CICIDS2017 (DoS, DDoS, Brute Force, Web Attacks, Infiltration)
