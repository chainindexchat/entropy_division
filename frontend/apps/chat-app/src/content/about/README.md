
# Entropy Division — Technical Design Specification
### Oracle by Solv  
### Zero-Knowledge Risk-Adjusted Compute Price Oracle

**Version:** 1.2  
**Status:** Draft for Hackathon Implementation  
**Authors:** Solv Team  
**Updated:** 2025-11-17


# Full Architecture Diagram

```
                     ┌──────────────────────────┐
                     │      Entropy Division     │
                     │   Zero-Knowledge Oracle   │
                     └──────────────┬───────────┘
                                    │
                         Risk Proof │
                                    ▼
          ┌────────────────────────────────────────────────┐
          │  Oracle by Solv: Risk-Adjusted Compute Pricing │
          └─────────────────┬──────────────────────────────┘
                            │ price, tier, disclosures
                            ▼
                     ┌───────────────┐
                     │   x402 Gate   │
                     └───────┬───────┘
                 payment req │ proof-of-payment
                            ▼
       ┌──────────────────────────────────────────────┐
       │         Confidential Benchmarking            │
       │     (AAGATE + ZK circuits in TEE/CVM)        │
       └──────────────────────┬───────────────────────┘
                              │ isolated execution
                              ▼
                 ┌──────────────────────────┐
                 │  Secure Model Container  │
                 └──────────────────────────┘
```

---

## 1. Overview

**Entropy Division** is a decentralized, privacy-preserving risk oracle for high-performance compute (HPC).  
It enables users to confidentially benchmark their AI models in a secure enclave, prove risk via zero-knowledge circuits, and access risk-adjusted GPU pricing.

Pricing, payment, and access are delivered through a cryptographically verifiable workflow built on:

- Trusted Execution Environments (TEE)
- Zero-Knowledge Proofs (ZKP)
- AAGATE risk benchmarking
- x402 Payment Challenge Protocol
- On-chain oracle commitments

This document defines the technical architecture, components, interfaces, and user flow.

---

## 2. System Objectives

### 2.1 Functional Objectives

1. Enable users to benchmark models inside attested confidential containers.  
2. Produce a verifiable **Risk Proof** without revealing the model.  
3. Compute a **risk-adjusted GPU price** using Oracle by Solv.  
4. Gate access to price discovery and compute via **x402 payment challenges**.  
5. Provide selective, programmable regulatory disclosures if required.  
6. Enable agents to autonomously discover, pay for, and use compute.

### 2.2 Non-Functional Objectives

- **Confidentiality:** No model code, data, or weights leave the enclave.  
- **Verifiability:** TEEs produce remote attestation; ZK circuits produce risk proofs.  
- **Neutrality:** Risk is derived exclusively from standardized benchmarking (AAGATE).  
- **Composability:** Oracle output can be consumed by DePIN/DeFi protocols.  
- **Performance:** GPU benchmarks complete in acceptable latency ranges (<5 min ideal).  
- **Reliability:** Service degrades gracefully on hardware unavailability.

---

## 3. Architecture Overview

Entropy Division is composed of **five layers**, each cryptographically validated.

```
Benchmark → Risk Proof → Pricing → Payment → Compute Access
```

---

## 4. System Architecture

### 4.1 Layer 0 — Attested Hardware

- Hardware: NVIDIA H100 or comparable secure GPU  
- Security: TEE/SNP/SGX-enabled node  
- Output: Hardware attestation report

### 4.2 Layer 1 — Confidential Benchmarking

Executed inside an attested secure container.

Components:

- AAGATE benchmarking suite  
- Model execution sandbox  
- Enclave-local telemetry collector  
- Local risk pre-processing  

Outputs:

- Enclave Attestation Digest  
- Benchmark Metrics (never exit enclave unencrypted)  

### 4.3 Layer 2 — Risk Circuits

Zero-knowledge circuits compute a **Risk Proof**.

Inputs:

- Benchmark scores  
- Attestation digest  
- Risk model parameters  

Outputs (public):

- `risk_tier`  
- `risk_score_commitment`  
- `zk_proof`  
- `compliance_flags`  

Outputs (private):

- Model data  
- Raw benchmarks

### 4.4 Layer 3 — Oracle by Solv

A decentralized oracle computing a **risk-adjusted GPU price**.

Formula example:

```
price_gpu_hour = base_rate * risk_multiplier(risk_tier)
```

Outputs:

- `gpu_price_usd`  
- `risk_multiplier`  
- On-chain commitment (optional)

### 4.5 Layer 4 — x402 Payment Gateway

Implements HTTP-style `402 Payment Required` challenges.

Flow:

1. Client requests a protected endpoint  
2. Server responds `402` + x402 invoice token  
3. Client pays invoice via MCP-compatible rails  
4. Client retries with proof-of-payment  

Inputs:

- USDC or equivalent stable assets  
- Coinbase MCP/x402 receipts  

Outputs:

- `payment_proof`  
- Access grant  

### 4.6 Layer 5 — Dashboard / Agent Interface

Minimalist UI exposing only allowed actions post-verification.

Capabilities:

- Initiate benchmark  
- Upload model into enclave  
- View risk tier + price  
- Pay via x402  
- Schedule compute jobs  

---

## 5. User Workflow Specification

### 5.1 High-Level Sequence

```
1. User Initiates Benchmark
2. TEE Attestation
3. AAGATE Benchmark Runs
4. ZK Risk Proof Generated
5. Oracle Computes Price
6. x402 Payment Challenge
7. User Provides Payment Proof
8. Compute Access Granted
```

---

## 6. Interaction Contracts

### 6.1 Dashboard User Verbs (Contract Surface)

#### Benchmarking

- `initiate_benchmark()`  
- `verify_attestation()`  
- `generate_risk_proof()`  
- `commit_score()`  

#### Pricing

- `request_price()`  
- `unlock_price()`  
- `compare_tiers()`  

#### Payment

- `receive_payment_challenge()`  
- `pay_invoice()`  
- `submit_payment_proof()`  

#### Compute Execution

- `schedule_compute()`  
- `monitor_job()`  
- `retrieve_outputs()`  

#### Compliance

- `select_disclosure_mode()`  
- `export_proofs()`  

---

## 7. x402 Technical Integration

### 7.1 Endpoint Behavior

Each protected endpoint returns:

```
HTTP/1.1 402 Payment Required
X-402-Invoice: <base64url-encoded-invoice-token>
Content-Type: application/json
```

Invoice token fields:

- `amount`  
- `currency`  
- `recipient`  
- `nonce`  
- `expires_at`  

### 7.2 Payment Proof Submission

Client resubmits original request:

```
Authorization: X402-Payment <proof>
```

Validation:

- signature  
- nonce  
- settlement  
- expiry  

If valid → forward to internal service.

---

## 8. Oracle Computation Logic

### 8.1 Inputs

- `risk_tier`  
- `risk_score_commitment`  
- `zk_proof`  
- Attestation verification  

### 8.2 Verification Steps

1. Validate TEE attestation  
2. Verify ZK proof  
3. Load risk multiplier table  
4. Compute GPU price  
5. Optionally commit proof to chain  

---

## 9. Security Considerations

### 9.1 Threats Mitigated

- Model exfiltration  
- Benchmark manipulation  
- Price manipulation  
- Payment spoofing  
- Attestation forgery  

### 9.2 Controls

- Hardware TEE  
- Remote attestation  
- Zero-knowledge risk proofs  
- Payment proof validation  
- Nonce replay protection  
- Enclave-sealed storage  

---

## 10. Future Extensions

- MPC-based distributed risk scoring  
- Interoperable multi-cloud TEE support  
- Persistent agent identities (DID-based)  
- Fully autonomous compute provisioning for agent economies  

---

## 11. Appendix

### 11.1 Glossary

- **AAGATE:** Standardized AI benchmarking suite  
- **TEE:** Trusted Execution Environment  
- **ZKP:** Zero-Knowledge Proof  
- **x402:** Payment challenge protocol  
- **MCP:** Coinbase Multiparty Payment Protocol  

---
