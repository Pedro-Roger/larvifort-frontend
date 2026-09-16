import { buildLiveCRMContext, formatCRMContextForPrompt, type LiveCRMContext } from "./aiContext";

export const STORAGE_KEY_OPENROUTER = "larvifort_openrouter_api_key";
export const STORAGE_KEY_MODEL = "larvifort_openrouter_model";

export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  badge?: string;
}

export const POPULAR_AI_MODELS: AIModelOption[] = [
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra (Free)",
    provider: "NVIDIA",
    badge: "Principal & Grátis",
  },
  {
    id: "nvidia/nemotron-3.5-lightning:free",
    name: "Nemotron 3.5 Lightning (Free)",
    provider: "NVIDIA",
    badge: "Rápido",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    badge: "Recomendado",
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    badge: "Ultra Rápido",
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "DeepSeek",
  },
];

export function getStoredOpenRouterKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY_OPENROUTER) || "";
}

export function setStoredOpenRouterKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_OPENROUTER, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_OPENROUTER);
  }
}

export function getStoredModel(): string {
  if (typeof window === "undefined") return POPULAR_AI_MODELS[0].id;
  return localStorage.getItem(STORAGE_KEY_MODEL) || POPULAR_AI_MODELS[0].id;
}

export function setStoredModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MODEL, model.trim());
}

export interface SendMessageToAIOptions {
  messages: Array<{ role?: string; sender?: string; text?: string; content?: string }>;
  customPrompt?: string;
  model?: string;
  apiKey?: string;
}

export interface AIResponseResult {
  reply: string;
  modelUsed?: string;
  source: "openrouter" | "local";
  error?: string;
  contextSnapshot?: LiveCRMContext;
}

/**
 * Sends messages to OpenRouter endpoint with live CRM data embedded.
 */
export async function queryLiaAI(options: SendMessageToAIOptions): Promise<AIResponseResult> {
  const storedKey = getStoredOpenRouterKey();
  const apiKey = options.apiKey || storedKey;
  const model = options.model || getStoredModel();

  // 1. Build live CRM context from database/frontend services
  let crmContextStr = "";
  let contextSnapshot: LiveCRMContext | undefined;
  try {
    contextSnapshot = await buildLiveCRMContext();
    crmContextStr = formatCRMContextForPrompt(contextSnapshot);
  } catch (err) {
    console.warn("Could not assemble full CRM context for AI:", err);
  }

  // 2. Format message list
  const formattedMessages = [...options.messages];
  if (options.customPrompt) {
    formattedMessages.push({ role: "user", text: options.customPrompt });
  }

  // 3. Call backend OpenRouter proxy
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedMessages,
        crmContext: crmContextStr,
        apiKey: apiKey || undefined,
        model,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return {
        reply: "",
        source: "local",
        error: errJson?.error || `Erro ${res.status} ao conectar à OpenRouter.`,
      };
    }

    const data = await res.json();
    return {
      reply: data.reply || "",
      modelUsed: data.modelUsed,
      source: "openrouter",
      contextSnapshot,
    };
  } catch (err) {
    return {
      reply: "",
      source: "local",
      error: err instanceof Error ? err.message : "Falha na comunicação de rede com o servidor.",
    };
  }
}

/**
 * Verifies if an OpenRouter API key is valid by sending a test ping
 */
export async function testOpenRouterKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  if (!apiKey.trim()) {
    return { success: false, message: "A chave da API está vazia." };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const label = data?.data?.label || "Chave válida";
      const limit = data?.data?.limit != null ? ` (Limite: $${data.data.limit})` : "";
      return { success: true, message: `Conexão bem-sucedida! ${label}${limit}` };
    }

    const errorJson = await res.json().catch(() => ({}));
    return {
      success: false,
      message: errorJson?.error?.message || `Erro ${res.status}: Chave inválida ou não autorizada.`,
    };
  } catch {
    return { success: false, message: "Não foi possível conectar ao servidor OpenRouter." };
  }
}
