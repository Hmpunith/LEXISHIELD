# 🏛️ LexiShield System Architecture Blueprint

## 1. High-Level System Topology

LexiShield is built upon an asynchronous, defensive legal risk intelligence pipeline:

```
[ Client / Web Browser ]
        │
        ▼ (HTTPS / Strict TLS 1.3 / HSTS)
[ Edge Layer / Vercel Serverless & Node.js Express ]
        │
        ├── [ Defense-in-Depth Middleware ]
        │      ├── Armor (CSP, Permissions-Policy, HSTS, COOP, CORP)
        │      ├── Tracer (Distributed X-Request-Id Correlation)
        │      ├── Gatekeeper (IP Token Bucket Rate Limiting)
        │      ├── Purifier (XSS & Prototype Pollution Sanitizer)
        │      └── Compression (Gzip / Deflate Streamer)
        │
        ├── [ Ephemeral In-Memory Storage ]
        │      ├── Volatile DocumentStore (Zero-Disk Retention)
        │      └── CacheService (Tiered L1 LRU + Redis Protocol Gateway)
        │
        └── [ Core Intelligence Engines ]
               ├── Ingestion Pipeline (Regex Boundary + Tokenizer)
               ├── VectorScorer (Mathematical Cosine Similarity)
               ├── Heuristic Benchmark Auditor (36+ ABA/URLTA Standards)
               ├── GenAI Service (Gemini 2.5 Flash + Flash-Lite Fallback)
               ├── Counter-Draft Engine (Negotiation Proposals)
               └── Document Counsel (Grounded Citations Q&A)
```

---

## 2. Ingestion & Boundary Analysis Pipeline

1. **Text Extraction**: Ingests `.pdf`, `.txt`, and raw text payloads without disk persistence.
2. **Deterministic Hashing**: Computes SHA-256 content hashes for instant cache lookups and verification.
3. **Multi-Pass Provision Splitter**:
   - Primary: Regex boundary detection for standard structural markers (`Section`, `Clause`, `Article`, Roman numerals).
   - Fallback: Density-aware heuristic chunker for unstructured agreements.

---

## 3. Dual-Tier Auditing & Vector Similarity Engine

```
[ Clause Input ]
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
[ Tier 1: Local Heuristics ]    [ Tier 2: GenAI Deep Reasoning ]
 - 36+ Market Standards          - Semantic Delta Scoring
 - VectorScorer Cosine Match     - Legal Intent & Latent Risk
 - Exact & Stemmed Keywords      - Counter-Proposal Synthesis
       │                                 │
       └────────────────┬────────────────┘
                        ▼
         [ Composite Exposure Score ]
         (Standard / Caution / Unfavorable / Critical)
```

- **VectorScorer**: Computes term-frequency vectors and normalized dot-product cosine distances across candidate clauses and standard model terms in sub-millisecond execution time.
- **Gemini 2.5 Flash Integration**: Analyzes subtle ambiguities, uncapped indemnities, one-sided termination terms, and generates actionable counter-draft proposals with negotiation rationale.

---

## 4. Tiered High-Performance Caching Architecture

- **L1 In-Memory LRU**: Stores processed audit reports indexed by SHA-256 hash, eliminating redundant LLM calls.
- **L2 Redis Gateway**: Production cluster protocol compatibility with automatic fallback.
- **Telemetry**: Exposes live hit/miss metrics (`hitRatio`, `itemCount`, `evictions`) via the `/api/health` diagnostic endpoint.

---

## 5. Security & Privacy Guarantees

- **Zero Persistent Retention**: Agreements exist solely within ephemeral application memory and are automatically evicted.
- **Prototype Pollution Prevention**: Input sanitizer explicitly strips `__proto__`, `constructor`, and `prototype` object properties.
- **Enterprise Headers**: Enforces strict `Content-Security-Policy`, `Strict-Transport-Security` (1-year preload), `Permissions-Policy`, and cross-origin isolation.
