import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_MODEL =
  process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages = [],
      crmContext,
      apiKey: customApiKey,
      model = DEFAULT_MODEL,
    } = body;

    const apiKey = (
      customApiKey ||
      process.env.OPENROUTER_API_KEY ||
      ""
    ).trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Chave da API OpenRouter não configurada.",
          code: "MISSING_API_KEY",
        },
        { status: 400 },
      );
    }

    // System prompt defining Lia's personality and embedding live CRM data
    const systemPrompt = `Você é Lia, assistente operacional do LarviFort CRM.
O LarviFort é um CRM focado em aquicultura comercial, nutrição aquícola, larvicultura de camarão e fazendas de engorda.

Sua missão é responder com clareza, precisão e proatividade aos consultores e gestores da LarviFort.
Você tem acesso aos DADOS REAIS DO SISTEMA no contexto abaixo.

${crmContext ? crmContext : "Contexto do CRM não carregado."}

DIRETRIZES DE RESPOSTA:
1. Responda em Português do Brasil de maneira executiva, amigável, direta e profissional.
2. Quando solicitado um resumo do dia:
   - Destaque o que foi realizado ontem (tarefas concluídas, visitas com GPS).
   - Apresente as prioridades de hoje (compromissos marcados, tarefas em andamento).
   - Liste as datas importantes mais próximas (próximos 7 a 14 dias).
   - Forneça 1 ou 2 pontos de atenção práticos, como clientes sem contato, metas ou tarefas atrasadas.
3. Use Markdown com títulos claros, marcadores em tópicos (•) e números em negrito. Não use emojis.
4. Ao citar módulos do sistema, mencione seus nomes oficiais (Quadro Kanban, Agenda, Clientes & Contatos, Empresas, Configurar Metas, Equipe, Pesquisa de Mercado).
5. Seja concisa e evite enrolação.`;

    const openRouterMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(
        (m: {
          sender?: string;
          role?: string;
          text?: string;
          content?: string;
        }) => ({
          role: m.role || (m.sender === "user" ? "user" : "assistant"),
          content: m.content || m.text || "",
        }),
      ),
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://larvifort.online",
          "X-Title": "LarviFort CRM",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          messages: openRouterMessages,
          temperature: 0.5,
          max_tokens: 1200,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", response.status, errorData);
      return NextResponse.json(
        {
          error:
            errorData?.error?.message ||
            `Erro ${response.status} na API OpenRouter. Verifique sua chave e saldo.`,
          status: response.status,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    const replyText =
      data?.choices?.[0]?.message?.content ||
      "Não foi possível obter resposta do modelo no momento.";

    return NextResponse.json({
      reply: replyText,
      modelUsed: data?.model || model,
      usage: data?.usage,
    });
  } catch (error) {
    console.error("Erro interno no endpoint de IA:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao processar requisição de IA." },
      { status: 500 },
    );
  }
}
