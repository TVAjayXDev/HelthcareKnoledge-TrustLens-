// Provider-agnostic LLM interface connected to Gemini API.
// Implements generate() with JSON mode & fallback, and embed() with 768-dim output.

export interface GenerateOptions {
  json?: boolean;
  systemInstruction?: string;
  temperature?: number;
}

export type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function getApiKey(): string {
  const key = process.env.LLM_API_KEY || "";
  if (!key.trim()) {
    throw new Error(
      "LLM_API_KEY is not configured in environment variables. Please add it to .env.local."
    );
  }
  return key.trim();
}

function getModel(): string {
  return process.env.LLM_MODEL || "gemini-3.5-flash";
}

function getFallbackModel(): string {
  return process.env.LLM_FALLBACK_MODEL || "gemini-3.5-flash-lite";
}

function getEmbedModel(): string {
  const model = process.env.EMBED_MODEL || "models/gemini-embedding-001";
  return model.startsWith("models/") ? model : `models/${model}`;
}

function getEmbedDim(): number {
  const dim = parseInt(process.env.EMBED_DIM || "768", 10);
  return isNaN(dim) ? 768 : dim;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute generation request against a specific Gemini model with timeout.
 */
async function callGenerateAPI(
  modelName: string,
  prompt: string,
  options: GenerateOptions = {},
  timeoutMs: number = 35000
): Promise<{ status: number; text?: string; error?: string }> {
  const key = getApiKey();
  const cleanModel = modelName.replace(/^models\//, "");
  const url = `${GEMINI_API_BASE}/models/${cleanModel}:generateContent?key=${key}`;

  const payload: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.1,
    },
  };

  if (options.json) {
    (payload.generationConfig as Record<string, unknown>).responseMimeType = "application/json";
  }

  if (options.systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const data = await res.json();

    if (!res.ok) {
      const errMsg =
        data?.error?.message || `Gemini API returned HTTP ${res.status}: ${res.statusText}`;
      return { status: res.status, error: errMsg };
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return { status: 200, text };
  } catch (err: unknown) {
    clearTimeout(timer);
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Request timed out after ${timeoutMs}ms`
          : err.message
        : "Network error";
    return { status: 500, error: message };
  }
}

/**
 * Robust LLM text generation with JSON support, exponential backoff retries,
 * and 429/503 fallback to gemini-3.5-flash-lite.
 */
export async function generate(
  prompt: string,
  options: GenerateOptions = {}
): Promise<string> {
  const primaryModel = getModel();
  const fallbackModel = getFallbackModel();

  let attempts = 0;
  const maxAttempts = 3;
  let lastError = "";

  while (attempts < maxAttempts) {
    attempts++;
    const res = await callGenerateAPI(primaryModel, prompt, options);

    if (res.status === 200 && typeof res.text === "string") {
      return res.text;
    }

    lastError = res.error || `HTTP ${res.status}`;

    // On 429 (rate limit), 503 (high demand), or 5xx server overload, cascade to available flash models
    if (
      res.status === 429 ||
      res.status === 503 ||
      res.status >= 500 ||
      res.error?.toLowerCase().includes("high demand") ||
      res.error?.toLowerCase().includes("spikes in demand")
    ) {
      const candidateFallbacks = [
        fallbackModel,
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite",
      ].filter((m) => m !== primaryModel);

      for (const altModel of candidateFallbacks) {
        console.warn(
          `[TrustLens LLM] ${primaryModel} busy (${res.error}). Trying ${altModel}...`
        );
        const fallbackRes = await callGenerateAPI(altModel, prompt, options);
        if (fallbackRes.status === 200 && typeof fallbackRes.text === "string") {
          return fallbackRes.text;
        }
      }

      // Exponential backoff delay: 1.5s, 3s
      await sleep(1500 * attempts);
    } else {
      // Non-retryable 4xx error (e.g. invalid syntax)
      break;
    }
  }

  throw new Error(`LLM generation failed after ${attempts} attempts: ${lastError}`);
}

/**
 * Embed a single text string using Gemini Embedding API.
 */
async function callEmbedAPI(
  text: string,
  taskType: EmbeddingTaskType,
  timeoutMs: number = 25000
): Promise<number[]> {
  const key = getApiKey();
  const embedModel = getEmbedModel();
  const embedDim = getEmbedDim();
  const url = `${GEMINI_API_BASE}/${embedModel}:embedContent?key=${key}`;

  const payload = {
    model: embedModel,
    content: { parts: [{ text }] },
    taskType,
    outputDimensionality: embedDim,
  };

  let attempts = 0;
  const maxAttempts = 3;
  let lastError = "";

  while (attempts < maxAttempts) {
    attempts++;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const data = await res.json();

      if (res.ok && data?.embedding?.values) {
        return data.embedding.values as number[];
      }

      lastError = data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 429 || res.status >= 500) {
        await sleep(1200 * attempts);
      } else {
        break;
      }
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err.message : "Network error";
      await sleep(1000 * attempts);
    }
  }

  throw new Error(`Gemini embedding failed after ${attempts} attempts: ${lastError}`);
}

/**
 * Generate vector embeddings for multiple texts.
 * Batches requests in groups of 5 with micro-throttling to respect free-tier rate limits.
 */
export async function embed(
  texts: string[],
  taskType: EmbeddingTaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[][]> {
  if (texts.length === 0) return [];

  const results: number[][] = [];
  const batchSize = 5;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map((text) => callEmbedAPI(text, taskType))
    );
    results.push(...batchEmbeddings);

    // Throttle slightly between batches to protect free tier
    if (i + batchSize < texts.length) {
      await sleep(200);
    }
  }

  return results;
}

/**
 * Single-text convenience embedding function.
 */
export async function embedOne(
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_QUERY"
): Promise<number[]> {
  const [vector] = await embed([text], taskType);
  return vector;
}
