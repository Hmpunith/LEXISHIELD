// server/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";

// server/middleware/armor.ts
import crypto from "crypto";
function armorMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  res.setHeader("X-Request-Id", requestId);
  req.requestId = requestId;
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://generativelanguage.googleapis.com https:;"
  );
  next();
}

// server/faults/catalog.ts
var LexiShieldFault = class extends Error {
  statusCode;
  code;
  isOperational;
  timestamp;
  details;
  constructor(message, statusCode = 500, code = "INTERNAL_FAULT", details) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
};
var DocumentParseFault = class extends LexiShieldFault {
  constructor(message, details) {
    super(message, 400, "DOCUMENT_PARSE_ERROR", details);
  }
};
var ThrottleFault = class extends LexiShieldFault {
  constructor(message = "Rate limit exceeded. Please wait a moment before sending more requests.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
};

// server/config/env.ts
import { z } from "zod";
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform((val) => parseInt(val, 10)).default("3001"),
  GEMINI_API_KEY: z.string().optional().default(""),
  MAX_FILE_SIZE_MB: z.string().transform((val) => parseInt(val, 10)).default("10"),
  RATE_LIMIT_RPM: z.string().transform((val) => parseInt(val, 10)).default("60"),
  CORS_ORIGIN: z.string().default("*")
});
var configCache = null;
function getConfig() {
  if (!configCache) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.warn("[Config] Notice: Environment validation warning:", parsed.error.format());
      configCache = {
        NODE_ENV: "development",
        PORT: 3001,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
        MAX_FILE_SIZE_MB: 10,
        RATE_LIMIT_RPM: 60,
        CORS_ORIGIN: "*"
      };
    } else {
      configCache = parsed.data;
    }
  }
  return configCache;
}

// server/middleware/gate.ts
var clientIpStore = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of clientIpStore.entries()) {
    if (now > record.resetTime) {
      clientIpStore.delete(ip);
    }
  }
}, 3e5);
function gatekeeperMiddleware(req, res, next) {
  const config = getConfig();
  const clientIp = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
  const ipKey = Array.isArray(clientIp) ? clientIp[0] : String(clientIp);
  const now = Date.now();
  const windowMs = 6e4;
  const maxRequests = config.RATE_LIMIT_RPM;
  const current = clientIpStore.get(ipKey);
  if (!current || now > current.resetTime) {
    clientIpStore.set(ipKey, { count: 1, resetTime: now + windowMs });
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
    return next();
  }
  current.count++;
  const remaining = Math.max(0, maxRequests - current.count);
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", remaining);
  if (current.count > maxRequests) {
    res.setHeader("Retry-After", Math.ceil((current.resetTime - now) / 1e3));
    return next(new ThrottleFault());
  }
  next();
}

// server/middleware/purify.ts
function sanitizeValue(val) {
  if (typeof val === "string") {
    return val.replace(/\0/g, "").replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/javascript:[^"']*/gi, "").trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === "object") {
    const cleaned = {};
    for (const [key, v] of Object.entries(val)) {
      cleaned[key] = sanitizeValue(v);
    }
    return cleaned;
  }
  return val;
}
function purifyInputMiddleware(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
}

// server/middleware/tracer.ts
function truncateLogString(str, maxLength = 160) {
  if (!str) {
    return "";
  }
  return str.length > maxLength ? `${str.slice(0, maxLength)}... [${str.length - maxLength} chars truncated]` : str;
}
function tracerMiddleware(req, res, next) {
  const start = Date.now();
  const reqId = req.requestId || "req-init";
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.info(
      `[${(/* @__PURE__ */ new Date()).toISOString()}] [${reqId}] ${req.method} ${req.originalUrl || req.url} Status=${res.statusCode} Duration=${duration}ms IP=${req.ip || "local"}`
    );
  });
  next();
}

// server/middleware/errorHandler.ts
function errorHandlerMiddleware(err, req, res, _next) {
  const reqId = req.requestId || "no-req-id";
  const isOperational = err.isOperational || false;
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || "INTERNAL_ERROR";
  console.error(`[ERROR] [${reqId}] Code=${errorCode} Status=${statusCode} Msg=${truncateLogString(err.message)}`);
  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || "An unexpected error occurred while processing the legal document.",
      requestId: reqId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...isOperational ? { details: err.details } : {}
    },
    disclaimer: "LexiShield provides automated informational assistance and does not constitute legal representation or advice."
  });
}

// server/routes/auditRoutes.ts
import { Router } from "express";
import multer from "multer";
import crypto4 from "crypto";

// server/modules/ingestion/textExtractor.ts
import pdfParse from "pdf-parse";
async function extractDocumentText(buffer, originalName) {
  const ext = originalName.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") {
    try {
      const data = await pdfParse(buffer);
      return data.text.trim();
    } catch (err) {
      throw new DocumentParseFault(`Failed to extract text from PDF file '${originalName}': ${err.message}`);
    }
  }
  try {
    return buffer.toString("utf8").trim();
  } catch (err) {
    throw new DocumentParseFault(`Failed to decode text file '${originalName}': ${err.message}`);
  }
}

// server/modules/ingestion/clauseSplitter.ts
import crypto2 from "crypto";
var CLAUSE_PATTERNS = [
  { type: "Indemnification" /* Indemnification */, regex: /\b(indemn\w*|hold\s+harmless|defend\s+and\s+hold)\b/i },
  { type: "Payment Terms" /* PaymentTerms */, regex: /\b(payment\w*|fee\w*|invoice\w*|compensation|remuneration|deposit|rent|interest)\b/i },
  { type: "Termination" /* Termination */, regex: /\b(terminat\w*|cancellation|rescission|cure\s+period)\b/i },
  { type: "Intellectual Property" /* IntellectualProperty */, regex: /\b(intellectual\s+property|work\s+for\s+hire|patent\w*|trademark\w*|copyright\w*|ownership\s+of\s+deliverables)\b/i },
  { type: "Non-Compete & Restrictive Covenants" /* NonCompete */, regex: /\b(non-compete|covenant\s+not\s+to\s+compete|restrictive\s+covenant|non-solicitation)\b/i },
  { type: "Confidentiality" /* Confidentiality */, regex: /\b(confidential\w*|nondisclosure|proprietary\s+information|trade\s+secret\w*)\b/i },
  { type: "Limitation of Liability" /* LimitationOfLiability */, regex: /\b(limitation\s+of\s+liability|aggregate\s+liability|consequential\s+damages|maximum\s+liability)\b/i },
  { type: "Governing Law & Jurisdiction" /* GoverningLaw */, regex: /\b(governing\s+law|jurisdiction|venue|laws\s+of\s+the\s+state)\b/i },
  { type: "Force Majeure" /* ForceMajeure */, regex: /\b(force\s+majeure|acts\s+of\s+god|unforeseen\s+circumstances)\b/i },
  { type: "Warranties & Disclaimers" /* Warranties */, regex: /\b(warrant\w*|as-is|disclaimer\s+of\s+warranties|guarantee\w*)\b/i },
  { type: "Dispute Resolution & Arbitration" /* DisputeResolution */, regex: /\b(arbitration|mediation|dispute\s+resolution|jury\s+trial\s+waiver)\b/i }
];
function inferClauseType(heading, bodyText) {
  const combined = `${heading} ${bodyText}`;
  for (const { type, regex } of CLAUSE_PATTERNS) {
    if (regex.test(heading)) {
      return type;
    }
  }
  for (const { type, regex } of CLAUSE_PATTERNS) {
    if (regex.test(combined)) {
      return type;
    }
  }
  return "Miscellaneous" /* Miscellaneous */;
}
function splitDocumentIntoClauses(rawText) {
  const cleaned = rawText.replace(/\r\n/g, "\n").trim();
  if (!cleaned) {
    return [];
  }
  const sectionSplitter = /(?:\n\s*(?:Section\s+\d+|Article\s+[IVXLCDM\d]+|\d+\.\d*|[A-Z][.)])\s*[:-–]?\s*)/gi;
  const rawSections = cleaned.split(sectionSplitter).map((s) => s.trim()).filter((s) => s.length > 20);
  const blocks = rawSections.length >= 2 ? rawSections : cleaned.split(/\n{2,}/).map((p) => p.trim()).filter((p) => p.length > 25);
  const results = [];
  blocks.forEach((block, index) => {
    const lines = block.split("\n");
    let title = lines[0].slice(0, 60).replace(/[^\w\s-]/g, "").trim();
    if (title.length < 5) {
      title = `Clause ${index + 1}`;
    }
    const clauseType = inferClauseType(title, block);
    const hash = crypto2.createHash("sha256").update(block).digest("hex");
    results.push({
      id: `clause-${index + 1}-${hash.slice(0, 8)}`,
      clauseIndex: index + 1,
      clauseType,
      title,
      text: block,
      wordCount: block.split(/\s+/).length,
      contentHash: hash
    });
  });
  return results;
}

// server/modules/benchmark/repository.ts
var MARKET_BENCHMARKS = [
  // Freelance & Consulting Agreements
  {
    id: "bm-freelance-indemnity-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Indemnification" /* Indemnification */,
    benchmarkText: "Each party shall defend, indemnify, and hold harmless the other party against any third-party claims, liabilities, or expenses resulting solely from the indemnifying party\u2019s gross negligence, willful misconduct, or material breach of this Agreement. Contractor\u2019s maximum indemnification obligation shall be capped at the total fees paid under this Agreement.",
    fairStandardExplanation: "Market standard requires mutual indemnification, tied strictly to gross negligence or willful misconduct, and capped at total contract compensation.",
    sourceAttribution: "ABA Business Law Model Consulting Guidelines"
  },
  {
    id: "bm-freelance-payment-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Payment Terms" /* PaymentTerms */,
    benchmarkText: "Client agrees to pay all undisputed invoiced amounts within thirty (30) days of receipt of invoice. Late payments shall accrue interest at the rate of 1.0% per month or the maximum statutory rate allowed by law. Client shall notify Contractor within ten (10) business days of any disputed invoice line items.",
    fairStandardExplanation: "Net-30 payment with reasonable late interest and prompt notice of billing disputes is standard market practice.",
    sourceAttribution: "Freelancers Union Standard Commercial Terms"
  },
  {
    id: "bm-freelance-termination-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Termination" /* Termination */,
    benchmarkText: "Either party may terminate this Agreement without cause upon thirty (30) calendar days written notice. In the event of termination, Client shall pay Contractor for all services satisfactorily rendered and expenses incurred through the effective termination date.",
    fairStandardExplanation: "Standard termination provides bilateral 30-day notice with guaranteed payment for work completed prior to termination.",
    sourceAttribution: "Standard Commercial Consulting Framework"
  },
  {
    id: "bm-freelance-ip-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Intellectual Property" /* IntellectualProperty */,
    benchmarkText: "Upon receipt of full payment for the deliverables, Contractor assigns to Client all right, title, and interest in and to the custom deliverables created specifically for Client. Contractor retains all right and ownership in its pre-existing tools, libraries, and general domain know-how.",
    fairStandardExplanation: "IP transfer should be conditioned on full payment, and the creator should retain pre-existing background code and tools.",
    sourceAttribution: "Tech Contract Standards (David Tollen model)"
  },
  {
    id: "bm-freelance-noncompete-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Non-Compete & Restrictive Covenants" /* NonCompete */,
    benchmarkText: "Contractor shall not solicit Client\u2019s employees during the term and for six (6) months thereafter. This Agreement does not restrict Contractor from performing services for other clients in any industry, provided no Confidential Information of Client is used.",
    fairStandardExplanation: "Independent contractors must remain free to serve other clients; broad non-competes on contractors are predatory and often legally unenforceable.",
    sourceAttribution: "Uniform Trade Secrets Act & FTC Rule Guidance"
  },
  {
    id: "bm-freelance-liability-01",
    documentType: "freelance_contract" /* FreelanceContract */,
    clauseType: "Limitation of Liability" /* LimitationOfLiability */,
    benchmarkText: "To the maximum extent permitted by law, neither party shall be liable for indirect, incidental, or consequential damages. Each party\u2019s total aggregate liability arising out of this Agreement shall be limited to the total amount paid or payable by Client in the twelve (12) months preceding the claim.",
    fairStandardExplanation: "Mutual exclusion of consequential damages and a 12-month fee cap represents the universal standard of fair risk allocation.",
    sourceAttribution: "Standard Commercial Model Contract Provisions"
  },
  // Lease Agreements
  {
    id: "bm-lease-deposit-01",
    documentType: "lease_agreement" /* LeaseAgreement */,
    clauseType: "Payment Terms" /* PaymentTerms */,
    benchmarkText: "Landlord shall hold the Security Deposit in an escrow account. Within twenty-one (21) days of lease termination, Landlord shall return the deposit with an itemized statement of any deductions for damages beyond reasonable wear and tear.",
    fairStandardExplanation: "Prompt return of deposits with required itemization and safe escrow handling is statutory best practice.",
    sourceAttribution: "Uniform Residential Landlord and Tenant Act (URLTA)"
  },
  {
    id: "bm-lease-entry-01",
    documentType: "lease_agreement" /* LeaseAgreement */,
    clauseType: "Miscellaneous" /* Miscellaneous */,
    benchmarkText: "Landlord may enter the premises for inspection or repairs only after providing at least twenty-four (24) hours advance written notice, during reasonable business hours, except in cases of immediate emergency threatening property or life.",
    fairStandardExplanation: "Tenants are entitled to quiet enjoyment; 24-hour advance written notice is standard for all non-emergency entries.",
    sourceAttribution: "Standard Model Residential Lease"
  },
  {
    id: "bm-lease-maintenance-01",
    documentType: "lease_agreement" /* LeaseAgreement */,
    clauseType: "Warranties & Disclaimers" /* Warranties */,
    benchmarkText: "Landlord shall maintain all structural components, plumbing, heating, electrical, and supplied appliances in good working order. Tenant shall maintain ordinary cleanliness and promptly notify Landlord of any required repairs.",
    fairStandardExplanation: "The implied warranty of habitability requires Landlords to bear major structural and system maintenance costs.",
    sourceAttribution: "URLTA Habitability Standards"
  },
  // Non-Disclosure Agreements (NDAs)
  {
    id: "bm-nda-confidentiality-01",
    documentType: "nda" /* NonDisclosureAgreement */,
    clauseType: "Confidentiality" /* Confidentiality */,
    benchmarkText: "Each party shall protect the other party\u2019s Confidential Information with the same degree of care it uses for its own confidential information, but not less than reasonable care. Confidential Information shall not be disclosed to any third party without prior written consent.",
    fairStandardExplanation: 'Mutual confidentiality obligations governed by standard "reasonable care" protect both parties equally.',
    sourceAttribution: "Silicon Valley Standard Mutual NDA Protocol"
  },
  {
    id: "bm-nda-duration-01",
    documentType: "nda" /* NonDisclosureAgreement */,
    clauseType: "Termination" /* Termination */,
    benchmarkText: "The obligations of confidentiality shall expire two (2) years from the date of disclosure, except for trade secrets, which shall remain protected for as long as they qualify as trade secrets under applicable law.",
    fairStandardExplanation: "Standard commercial NDAs expire after 2\u20133 years; perpetual confidentiality for general business information is overly restrictive.",
    sourceAttribution: "International Technology Law Association Model NDA"
  },
  {
    id: "bm-nda-exceptions-01",
    documentType: "nda" /* NonDisclosureAgreement */,
    clauseType: "Confidentiality" /* Confidentiality */,
    benchmarkText: "Confidential Information does not include information that: (a) is or becomes publicly known through no breach; (b) was already known prior to disclosure; (c) is independently developed without reference to the information; or (d) is required to be disclosed by law or court order.",
    fairStandardExplanation: "Universal standard exclusion clauses are necessary to prevent claims over public or independently developed knowledge.",
    sourceAttribution: "Uniform Trade Secrets Act Exclusions"
  },
  // SaaS Agreements
  {
    id: "bm-saas-liability-01",
    documentType: "saas_agreement" /* SaaSAgreement */,
    clauseType: "Limitation of Liability" /* LimitationOfLiability */,
    benchmarkText: "Except for indemnification obligations and breaches of confidentiality, neither party\u2019s aggregate liability arising out of or related to this Agreement shall exceed the total amount paid by Customer in the twelve (12) months preceding the incident.",
    fairStandardExplanation: "SaaS agreements standardly cap liability at 12 months fees, with mutual exceptions for gross breach.",
    sourceAttribution: "Bespoke Tech Law Standard MSA Guidelines"
  },
  {
    id: "bm-saas-sla-01",
    documentType: "saas_agreement" /* SaaSAgreement */,
    clauseType: "Warranties & Disclaimers" /* Warranties */,
    benchmarkText: "Provider warrants that the Service will achieve at least 99.9% availability during each calendar month. In the event of a breach of this warranty, Customer\u2019s sole and exclusive remedy shall be service credits calculated according to Exhibit A.",
    fairStandardExplanation: "99.9% uptime with service credit remedies is standard cloud software tier expectation.",
    sourceAttribution: "Enterprise Cloud SLA Standards"
  }
];

// server/modules/benchmark/matcher.ts
function calculateJaccardSimilarity(textA, textB) {
  const tokenize = (s) => new Set(
    s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2)
  );
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }
  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) {
      intersection++;
    }
  }
  const union = setA.size + setB.size - intersection;
  return union > 0 ? intersection / union : 0;
}
function findNearestBenchmark(clauseText, clauseType, _docType = "general_agreement" /* GeneralAgreement */) {
  const typeMatches = MARKET_BENCHMARKS.filter((b) => b.clauseType === clauseType);
  const pool = typeMatches.length > 0 ? typeMatches : MARKET_BENCHMARKS;
  let bestMatch = pool[0];
  let highestSimilarity = -1;
  for (const bm of pool) {
    const sim = calculateJaccardSimilarity(clauseText, bm.benchmarkText);
    if (sim > highestSimilarity) {
      highestSimilarity = sim;
      bestMatch = bm;
    }
  }
  const normalized = Math.min(0.95, Math.max(0.35, Math.round(highestSimilarity * 100) / 100 + 0.3));
  return {
    benchmark: bestMatch,
    similarity: normalized
  };
}

// server/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var DISCLAIMER = "IMPORTANT LEGAL NOTICE: You are an educational legal information assistant. Your output is for informational and educational purposes only and does NOT constitute legal advice, representation, or attorney-client privilege. Emphasize that users should consult a qualified legal professional.";
var CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-1.5-flash"];
var genAIClient = null;
function getClient() {
  const config = getConfig();
  if (!config.GEMINI_API_KEY) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  }
  return genAIClient;
}
async function askGeminiJson(systemPrompt, userPrompt, fallbackGenerator) {
  const client = getClient();
  if (!client) {
    return fallbackGenerator();
  }
  const fullSystem = `${systemPrompt}

${DISCLAIMER}

Return strictly valid JSON only.`;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: fullSystem,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      });
      const result = await model.generateContent(userPrompt);
      const rawText = result.response.text();
      const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (err) {
      console.warn(`[Gemini] Model ${modelName} call notice: ${err.message}. Trying next candidate or fallback...`);
    }
  }
  return fallbackGenerator();
}

// server/modules/audit/riskAuditor.ts
function evaluateHeuristicRisk(clause) {
  const text = clause.text.toLowerCase();
  if (text.includes("indemnif") && !text.includes("mutual") && (text.includes("unlimited") || text.includes("any and all claims") || !text.includes("gross negligence"))) {
    return {
      riskLevel: "Critical" /* Critical */,
      riskScore: 92,
      reason: "Unilateral, uncapped indemnification exposing you to third-party liabilities without reciprocal protection."
    };
  }
  if ((text.includes("non-compete") || /not\s+engage\s+in\s+any.*business/i.test(text) || text.includes("competitive business")) && (text.includes("worldwide") || text.includes("perpetual") || text.includes("two (2) years") || text.includes("3 years") || text.includes("24 months"))) {
    return {
      riskLevel: "Critical" /* Critical */,
      riskScore: 95,
      reason: "Overly restrictive non-compete covenant with excessive duration or global geographic scope."
    };
  }
  if (text.includes("waives all claims") || text.includes("sole and absolute discretion") || text.includes("all right, title, and interest... in any idea") || text.includes("60 days") || text.includes("90 days after invoice")) {
    return {
      riskLevel: "Unfavorable" /* Unfavorable */,
      riskScore: 78,
      reason: "Disproportionately one-sided rights favoring the drafting party (delayed payments, broad waiver, or unrestricted discretion)."
    };
  }
  if (text.includes("liquidated damages") || text.includes("automatic renewal") || text.includes("binding arbitration") || text.includes("without cause") || text.includes("attorney fees to the prevailing party")) {
    return {
      riskLevel: "Caution" /* Caution */,
      riskScore: 55,
      reason: "Standard clause with procedural nuances or cost implications (automatic renewals, unilateral dispute venues)."
    };
  }
  return {
    riskLevel: "Standard" /* Standard */,
    riskScore: 18,
    reason: "Aligns closely with market-standard legal norms and bilateral protections."
  };
}
async function auditClause(clause, docType) {
  const { benchmark, similarity } = findNearestBenchmark(clause.text, clause.clauseType, docType);
  const heuristic = evaluateHeuristicRisk(clause);
  const fallbackData = {
    plainEnglishSummary: heuristic.reason,
    deviationAnalysis: `Compared to ${benchmark.sourceAttribution}, this clause has a similarity index of ${(similarity * 100).toFixed(0)}%. ${heuristic.reason}`,
    counterProposal: heuristic.riskLevel !== "Standard" /* Standard */ ? {
      proposedClause: benchmark.benchmarkText,
      rationale: `Replace one-sided language with the established fair-market standard from ${benchmark.sourceAttribution}.`,
      negotiationStrategy: "Request this balanced phrasing during the initial contract mark-up phase before signing."
    } : void 0
  };
  const aiResult = await askGeminiJson(
    "You are a senior contract auditing attorney. Analyze legal risk accurately.",
    `Analyze this contract clause against the fair market standard benchmark:
    
    CLAUSE TYPE: ${clause.clauseType}
    UPLOADED CLAUSE TEXT:
    "${clause.text}"
    
    MARKET BENCHMARK STANDARD:
    "${benchmark.benchmarkText}"
    
    Provide a JSON object with:
    {
      "plainEnglishSummary": "2-sentence plain-English breakdown of what this clause means for the signer",
      "deviationAnalysis": "How it deviates from fair market standards",
      "riskLevel": "Standard" | "Caution" | "Unfavorable" | "Critical",
      "riskScore": number from 0 to 100,
      "counterProposal": {
        "proposedClause": "Fair revised clause language",
        "rationale": "Legal reasoning",
        "negotiationStrategy": "Tactical email tip"
      }
    }`,
    () => fallbackData
  );
  const finalRiskLevel = aiResult.riskLevel || heuristic.riskLevel;
  const finalRiskScore = aiResult.riskScore || heuristic.riskScore;
  return {
    ...clause,
    riskLevel: finalRiskLevel,
    riskScore: finalRiskScore,
    similarityToBenchmark: similarity,
    matchedBenchmarkId: benchmark.id,
    matchedBenchmarkText: benchmark.benchmarkText,
    plainEnglishSummary: aiResult.plainEnglishSummary || fallbackData.plainEnglishSummary,
    deviationAnalysis: aiResult.deviationAnalysis || fallbackData.deviationAnalysis,
    counterProposal: aiResult.counterProposal || fallbackData.counterProposal
  };
}

// server/modules/intelligence/gotchasSynthesizer.ts
function synthesizeGotchas(clauses) {
  const riskyClauses = clauses.filter((c) => c.riskLevel === "Critical" /* Critical */ || c.riskLevel === "Unfavorable" /* Unfavorable */).sort((a, b) => b.riskScore - a.riskScore);
  const warnings = [];
  riskyClauses.slice(0, 5).forEach((clause, i) => {
    warnings.push({
      id: `gotcha-${i + 1}`,
      title: `Dangerous ${clause.clauseType} Terms`,
      riskLevel: clause.riskLevel,
      clauseType: clause.clauseType,
      concern: clause.plainEnglishSummary,
      recommendation: clause.counterProposal?.negotiationStrategy || "Insist on mutual protections or cap your total exposure before signing.",
      relatedClauseIndex: clause.clauseIndex
    });
  });
  if (warnings.length === 0) {
    warnings.push({
      id: "gotcha-fair-01",
      title: "No Critical Traps Detected",
      riskLevel: "Standard" /* Standard */,
      clauseType: clauses[0]?.clauseType || "General",
      concern: "The agreement clauses largely comply with recognized fair market standards.",
      recommendation: "Perform a final routine read-through and verify operational dates and payment sums.",
      relatedClauseIndex: 1
    });
  }
  return warnings;
}

// server/modules/intelligence/checklistForge.ts
function forgeComplianceChecklist(clauses) {
  const items = [];
  clauses.forEach((c, idx) => {
    if (c.riskLevel === "Critical" /* Critical */ || c.riskLevel === "Unfavorable" /* Unfavorable */) {
      items.push({
        id: `chk-risk-${idx + 1}`,
        category: "Immediate Negotiation",
        task: `Propose counter-amendment to ${c.title} (${c.clauseType}) to remove one-sided liabilities.`,
        deadlineOrTrigger: "Before signing or executing the agreement",
        riskIfIgnored: "Uncapped financial liability or restrictive covenants enforceable in court.",
        completed: false
      });
    }
    if (c.clauseType === "Payment Terms") {
      items.push({
        id: `chk-pay-${idx + 1}`,
        category: "Financial Milestone",
        task: "Set calendar reminders for invoice submission dates and verify net payment terms.",
        deadlineOrTrigger: "Monthly billing cycle",
        riskIfIgnored: "Cashflow interruptions and disputed delayed payments.",
        completed: false
      });
    }
    if (c.clauseType === "Termination") {
      items.push({
        id: `chk-term-${idx + 1}`,
        category: "Exit Strategy",
        task: "Document required written notice periods (e.g. 30 days) and acceptable delivery methods.",
        deadlineOrTrigger: "Prior to contract expiration or planned exit",
        riskIfIgnored: "Automatic agreement renewal or wrongful termination claims.",
        completed: false
      });
    }
  });
  if (items.length < 3) {
    items.push(
      {
        id: "chk-def-1",
        category: "Pre-Execution Verification",
        task: "Verify legal names, entity registration status, and authorized signatory powers of all parties.",
        deadlineOrTrigger: "Prior to signature",
        riskIfIgnored: "Contract invalidity or signing against an unverified entity.",
        completed: false
      },
      {
        id: "chk-def-2",
        category: "Record Keeping",
        task: "Archive fully-executed digital PDF copy in encrypted corporate cloud storage.",
        deadlineOrTrigger: "Within 24 hours of countersignature",
        riskIfIgnored: "Loss of binding evidentiary documentation in case of future audit.",
        completed: false
      }
    );
  }
  return items;
}

// server/modules/intelligence/attorneyBrief.ts
function buildAttorneyConsultationBrief(clauses, docType, filename) {
  const criticals = clauses.filter((c) => c.riskLevel === "Critical" /* Critical */ || c.riskLevel === "Unfavorable" /* Unfavorable */);
  const suggestedQuestions = [
    `Are the liability caps in ${filename} customary for this tier of ${docType.replace("_", " ")} in our target jurisdiction?`,
    "Does the indemnification clause expose my business or personal assets to third-party intellectual property claims?",
    "If the counterparty initiates termination without cause, what specific legal remedies protect my accrued fees?",
    "Is the dispute resolution forum and governing law jurisdiction balanced, or does it impose burdensome travel and arbitration expenses?"
  ];
  if (criticals.some((c) => c.clauseType.includes("Non-Compete"))) {
    suggestedQuestions.unshift(
      "Is the non-compete / restrictive covenant legally enforceable under current state and federal FTC regulations?"
    );
  }
  return {
    documentSummary: `Audit of '${filename}' identified ${clauses.length} distinct clauses. Found ${criticals.length} high-exposure clauses requiring legal clarification.`,
    keyRisksIdentified: criticals.map((c) => `${c.clauseType}: ${c.plainEnglishSummary}`),
    suggestedQuestionsForAttorney: suggestedQuestions,
    recommendedNegotiationPoints: criticals.map((c) => c.counterProposal?.proposedClause ? `Revise Section ${c.clauseIndex}: ${c.counterProposal.rationale}` : `Negotiate bilateral rights for Section ${c.clauseIndex}`),
    jurisdictionNotes: "Standard recommendation: Ensure governing law resides in the signer\u2019s local state jurisdiction to minimize venue litigation overhead."
  };
}

// server/storage/connection.ts
var MemoryStore = class {
  documents = /* @__PURE__ */ new Map();
  saveDocument(id, filename, rawText) {
    const doc = {
      id,
      filename,
      rawText,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.documents.set(id, doc);
    return doc;
  }
  getDocument(id) {
    return this.documents.get(id) || null;
  }
  saveAudit(id, report) {
    const doc = this.documents.get(id);
    if (doc) {
      doc.auditReport = report;
    }
  }
  getAll() {
    return Array.from(this.documents.values());
  }
};
var documentStore = new MemoryStore();

// server/services/memoVault.ts
import crypto3 from "crypto";
var MemoVault = class {
  static store = /* @__PURE__ */ new Map();
  static DEFAULT_TTL_MS = 1e3 * 60 * 60;
  // 1 hour
  static hashContent(content) {
    return crypto3.createHash("sha256").update(content).digest("hex");
  }
  static set(key, data, ttlMs = this.DEFAULT_TTL_MS) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs
    });
  }
  static get(key) {
    const item = this.store.get(key);
    if (!item) {
      return null;
    }
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.data;
  }
  static clear() {
    this.store.clear();
  }
};

// server/routes/auditRoutes.ts
var router = Router();
var upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
function getParamId(req) {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}
router.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    let rawText = "";
    let filename = "document.txt";
    if (req.file) {
      filename = req.file.originalname;
      rawText = await extractDocumentText(req.file.buffer, filename);
    } else if (req.body && req.body.text) {
      rawText = String(req.body.text);
      filename = req.body.filename || "Pasted_Contract.txt";
    } else {
      throw new DocumentParseFault("No document file or text body provided in request.");
    }
    if (rawText.length < 30) {
      throw new DocumentParseFault("Provided document text is too short to parse meaningful legal provisions.");
    }
    const docId = `doc-${crypto4.randomUUID()}`;
    documentStore.saveDocument(docId, filename, rawText);
    res.status(201).json({
      success: true,
      documentId: docId,
      filename,
      characterCount: rawText.length,
      wordCount: rawText.split(/\s+/).length,
      message: "Document successfully ingested. Ready for automated audit."
    });
  } catch (err) {
    next(err);
  }
});
router.post("/:id/analyze", async (req, res, next) => {
  try {
    const docId = getParamId(req);
    const doc = documentStore.getDocument(docId);
    if (!doc) {
      throw new DocumentParseFault(`Document ID '${docId}' not found or session expired.`);
    }
    const cacheKey = `audit:${MemoVault.hashContent(doc.rawText)}`;
    const cachedReport = MemoVault.get(cacheKey);
    if (cachedReport) {
      documentStore.saveAudit(docId, cachedReport);
      return res.json({ success: true, report: cachedReport, cached: true });
    }
    const docType = req.body?.documentType || "freelance_contract" /* FreelanceContract */;
    const parsedClauses = splitDocumentIntoClauses(doc.rawText);
    const auditedClauses = await Promise.all(
      parsedClauses.map((clause) => auditClause(clause, docType))
    );
    const gotchas = synthesizeGotchas(auditedClauses);
    const checklist = forgeComplianceChecklist(auditedClauses);
    const attorneyBrief = buildAttorneyConsultationBrief(auditedClauses, docType, doc.filename);
    const riskDist = {
      standard: auditedClauses.filter((c) => c.riskLevel === "Standard" /* Standard */).length,
      caution: auditedClauses.filter((c) => c.riskLevel === "Caution" /* Caution */).length,
      unfavorable: auditedClauses.filter((c) => c.riskLevel === "Unfavorable" /* Unfavorable */).length,
      critical: auditedClauses.filter((c) => c.riskLevel === "Critical" /* Critical */).length
    };
    const avgRisk = auditedClauses.length > 0 ? auditedClauses.reduce((acc, c) => acc + c.riskScore, 0) / auditedClauses.length : 20;
    const overallScore = Math.max(10, Math.min(98, Math.round(100 - avgRisk)));
    const report = {
      documentId: docId,
      filename: doc.filename,
      documentType: docType,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      clauseCount: auditedClauses.length,
      wordCount: doc.rawText.split(/\s+/).length,
      overallScore,
      riskDistribution: riskDist,
      gotchas,
      clauses: auditedClauses,
      checklist,
      attorneyBrief,
      legalDisclaimer: "Informational analysis only. Not legal advice or attorney representation."
    };
    documentStore.saveAudit(docId, report);
    MemoVault.set(cacheKey, report);
    res.json({
      success: true,
      report,
      cached: false
    });
  } catch (err) {
    next(err);
  }
});
router.get("/:id/report", (req, res, next) => {
  try {
    const docId = getParamId(req);
    const doc = documentStore.getDocument(docId);
    if (!doc || !doc.auditReport) {
      throw new DocumentParseFault(`Audit report for ID '${docId}' not found. Please trigger analysis first.`);
    }
    res.json({ success: true, report: doc.auditReport });
  } catch (err) {
    next(err);
  }
});
var auditRoutes_default = router;

// server/routes/counselRoutes.ts
import { Router as Router2 } from "express";

// server/modules/intelligence/counselChat.ts
async function answerLegalQuestion(question, clauses, _history = []) {
  const context = clauses.map((c) => `[Clause ${c.clauseIndex}: ${c.title} (${c.clauseType})] ${c.text}`).join("\n\n");
  const lowerQ = question.toLowerCase();
  const relevantClauses = clauses.filter(
    (c) => c.text.toLowerCase().includes(lowerQ) || lowerQ.split(/\s+/).some((word) => word.length > 3 && c.text.toLowerCase().includes(word))
  );
  const fallbackCitations = (relevantClauses.length > 0 ? relevantClauses : clauses.slice(0, 2)).map((c) => ({
    clauseIndex: c.clauseIndex,
    snippet: c.text.slice(0, 180) + "..."
  }));
  const fallbackAnswer = `Based on the document text in Clause ${fallbackCitations[0]?.clauseIndex || 1}, ${clauses.find((c) => c.clauseIndex === fallbackCitations[0]?.clauseIndex)?.plainEnglishSummary || "the agreement sets forth standard obligations regarding this topic."} Always have an attorney review binding interpretations.`;
  return askGeminiJson(
    "You are Document Counsel, an intelligent legal assistant. Answer questions strictly grounded on the provided contract text. Cite exact Clause numbers.",
    `CONTRACT CONTEXT:
    ${context.slice(0, 8e3)}
    
    USER QUESTION:
    ${question}
    
    Respond with JSON:
    {
      "answer": "Accurate, clear plain-English answer grounded directly in the contract terms. Note what is present and what is missing.",
      "citations": [
        { "clauseIndex": 1, "snippet": "Relevant text quote from contract" }
      ]
    }`,
    () => ({
      answer: fallbackAnswer,
      citations: fallbackCitations
    })
  );
}

// server/routes/counselRoutes.ts
var router2 = Router2();
router2.post("/chat", async (req, res, next) => {
  try {
    const { documentId, question, history } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question string is required." });
    }
    const doc = documentStore.getDocument(documentId);
    if (!doc || !doc.auditReport) {
      throw new DocumentParseFault(`Document ID '${documentId}' with completed audit not found.`);
    }
    const result = await answerLegalQuestion(question, doc.auditReport.clauses, history || []);
    res.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      disclaimer: "Answers are generated for general understanding and do not replace legal counsel."
    });
  } catch (err) {
    next(err);
  }
});
var counselRoutes_default = router2;

// server/routes/compareRoutes.ts
import { Router as Router3 } from "express";

// server/modules/intelligence/comparisonDiff.ts
function compareTwoAgreements(docAText, docAName, docBText, docBName) {
  const clausesA = splitDocumentIntoClauses(docAText);
  const clausesB = splitDocumentIntoClauses(docBText);
  const typesInA = new Set(clausesA.map((c) => c.clauseType));
  const typesInB = new Set(clausesB.map((c) => c.clauseType));
  const allTypes = Array.from(/* @__PURE__ */ new Set([...typesInA, ...typesInB]));
  const clauseComparisons = allTypes.map((type) => {
    const clauseA = clausesA.find((c) => c.clauseType === type);
    const clauseB = clausesB.find((c) => c.clauseType === type);
    let winner = "Equivalent";
    let analysis = "Both documents provide similar structural coverage.";
    if (clauseA && !clauseB) {
      winner = "Document A";
      analysis = `Only present in ${docAName}. Absent in ${docBName}.`;
    } else if (!clauseA && clauseB) {
      winner = "Document B";
      analysis = `Only present in ${docBName}. Absent in ${docAName}.`;
    } else if (clauseA && clauseB) {
      if (clauseA.text.toLowerCase().includes("mutual") && !clauseB.text.toLowerCase().includes("mutual")) {
        winner = "Document A";
        analysis = `${docAName} provides fair mutual protections; ${docBName} uses one-sided language.`;
      } else if (!clauseA.text.toLowerCase().includes("mutual") && clauseB.text.toLowerCase().includes("mutual")) {
        winner = "Document B";
        analysis = `${docBName} provides fair mutual protections; ${docAName} uses one-sided language.`;
      } else {
        winner = "Equivalent";
        analysis = `Both agreements contain standard ${type} provisions with minor stylistic variance.`;
      }
    }
    return {
      clauseType: type,
      docAText: clauseA ? clauseA.text : "(Not provided in this version)",
      docBText: clauseB ? clauseB.text : "(Not provided in this version)",
      analysis,
      winner
    };
  });
  return {
    docAName,
    docBName,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    summaryOfDifferences: `Compared ${clausesA.length} clauses in '${docAName}' against ${clausesB.length} clauses in '${docBName}'.`,
    riskDivergence: {
      docARiskierClauses: clauseComparisons.filter((c) => c.winner === "Document B").map((c) => c.clauseType),
      docBRiskierClauses: clauseComparisons.filter((c) => c.winner === "Document A").map((c) => c.clauseType),
      identicalProvisions: clauseComparisons.filter((c) => c.winner === "Equivalent").map((c) => c.clauseType)
    },
    clauseComparisons,
    negotiationRecommendation: `Use '${docAName}' as the preferred drafting baseline if bilateral terms are favored, adopting specific clarifying language from '${docBName}'.`,
    legalDisclaimer: "This comparison provides automated clause delta indicators for informational review. Not legal advice."
  };
}

// server/routes/compareRoutes.ts
var router3 = Router3();
router3.post("/documents", (req, res, next) => {
  try {
    const { docAText, docAName, docBText, docBName } = req.body;
    if (!docAText || !docBText) {
      throw new DocumentParseFault("Both docAText and docBText are required for agreement comparison.");
    }
    const comparison = compareTwoAgreements(
      String(docAText),
      docAName || "Agreement A",
      String(docBText),
      docBName || "Agreement B"
    );
    res.json({
      success: true,
      comparison
    });
  } catch (err) {
    next(err);
  }
});
var compareRoutes_default = router3;

// server/app.ts
function createServerApp() {
  const app2 = express();
  app2.use(helmet({ crossOriginResourcePolicy: false }));
  app2.use(cors({ origin: true, credentials: true }));
  app2.use(express.json({ limit: "10mb" }));
  app2.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app2.use(armorMiddleware);
  app2.use(tracerMiddleware);
  app2.use(gatekeeperMiddleware);
  app2.use(purifyInputMiddleware);
  app2.get("/api/health", (_req, res) => {
    res.json({
      status: "healthy",
      system: "LexiShield Legal Risk Intelligence Engine",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.use("/api/audit", auditRoutes_default);
  app2.use("/api/counsel", counselRoutes_default);
  app2.use("/api/compare", compareRoutes_default);
  app2.use(errorHandlerMiddleware);
  return app2;
}
var app = createServerApp();
var app_default = app;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.info(`\u{1F6E1}\uFE0F [LexiShield Server] Running at http://localhost:${PORT}`);
  });
}

// api/index.ts
var index_default = app_default;
export {
  index_default as default
};
