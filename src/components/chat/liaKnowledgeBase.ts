export interface QuickAction {
  id: string;
  title: string;
  description: string;
  category: "comercial" | "gestao" | "equipe" | "config";
  iconName: string;
  href?: string;
  actionKey?: string;
  badge?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category:
    | "kanban"
    | "agenda"
    | "clientes"
    | "metas"
    | "equipe"
    | "automacoes"
    | "pesquisa";
  keywords: string[];
  actionLink?: {
    label: string;
    href: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: "lia" | "user";
  text: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    href?: string;
    actionKey?: string;
  }>;
  suggestedQuestions?: string[];
}

export const LIA_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "action-kanban",
    title: "Acessar Quadro Kanban",
    description: "Gerencie tarefas, cards e fluxos de trabalho",
    category: "gestao",
    iconName: "Kanban",
    href: "/kanban",
    badge: "Principal",
  },
  {
    id: "action-agenda",
    title: "Agendar Compromisso",
    description: "Marque reuniões e visitas com clientes",
    category: "comercial",
    iconName: "CalendarDots",
    href: "/agenda",
  },
  {
    id: "action-cliente",
    title: "Cadastrar Novo Cliente",
    description: "Adicione contatos e informações comerciais",
    category: "comercial",
    iconName: "AddressBook",
    href: "/clientes",
  },
  {
    id: "action-empresa",
    title: "Cadastrar Empresa",
    description: "Gerencie fazendas, distribuidores e parceiros",
    category: "comercial",
    iconName: "Buildings",
    href: "/empresas",
  },
  {
    id: "action-metas",
    title: "Configurar Metas",
    description: "Ajuste metas de vendas em valor (R$) e volume",
    category: "config",
    iconName: "Target",
    href: "/configurar-metas",
  },
  {
    id: "action-pesquisa",
    title: "Pesquisa de Mercado",
    description: "Colete e analise dados do mercado aquícola",
    category: "comercial",
    iconName: "ClipboardText",
    href: "/pesquisa",
  },
  {
    id: "action-equipe",
    title: "Gerenciar Equipe",
    description: "Adicione membros, cargos e monte times",
    category: "equipe",
    iconName: "UsersThree",
    href: "/equipe",
  },
  {
    id: "action-dashboard",
    title: "Ver Dashboard Geral",
    description: "Monitore métricas, conversões e gráficos",
    category: "gestao",
    iconName: "SquaresFour",
    href: "/dashboard",
  },
];

export const LIA_FAQ_LIST: FAQItem[] = [
  {
    id: "faq-kanban-quadro",
    question: "Como criar ou alternar quadros no Kanban?",
    answer:
      "No menu superior do **Quadro Kanban**, clique no seletor de projetos/quadros. Para criar um novo, clique no botão **'+'** ou **'Novo Quadro'**. Você pode usar o assistente passo a passo (Wizard) ou escolher um template pré-definido como Vendas, Suporte ou Onboarding.",
    category: "kanban",
    keywords: [
      "kanban",
      "quadro",
      "projeto",
      "criar quadro",
      "wizard",
      "template",
      "mudar quadro",
    ],
    actionLink: {
      label: "Ir para o Kanban",
      href: "/kanban",
    },
  },
  {
    id: "faq-kanban-regras-automacoes",
    question: "Como funcionam as Regras e Automações do Kanban?",
    answer:
      "No cabeçalho do Kanban você encontra dois botões essenciais: **'Regras'** (define transições permitidas e requisitos entre colunas) e **'Automações'** (executa ações automáticas quando uma tarefa é criada, movida ou concluída, inclusive criando tarefas automaticamente a partir de compromissos da Agenda).",
    category: "automacoes",
    keywords: [
      "regras",
      "automacoes",
      "automacao",
      "trigger",
      "bastao",
      "passagem",
      "transicao",
      "kanban",
    ],
    actionLink: {
      label: "Configurar Automações",
      href: "/kanban",
    },
  },
  {
    id: "faq-agenda-checkin-gps",
    question: "Como fazer check-in com GPS na visita ao cliente?",
    answer:
      "Na tela de **Agenda**, localize o card do compromisso agendado. Clique no botão **'Fazer Check-in'**. O sistema solicitará permissão de localização do seu navegador/celular e registrará as coordenadas GPS exatas (latitude/longitude) com timestamp para comprovação da visita.",
    category: "agenda",
    keywords: [
      "checkin",
      "check-in",
      "gps",
      "localizacao",
      "visita",
      "agenda",
      "compromisso",
      "coordenadas",
    ],
    actionLink: {
      label: "Abrir Agenda",
      href: "/agenda",
    },
  },
  {
    id: "faq-clientes-cadastro",
    question: "Como cadastrar e vincular clientes a empresas?",
    answer:
      "Acesse **Clientes & Contatos** no menu lateral e clique em **'+ Adicionar Contato'**. Preencha nome, e-mail, telefone, cargo e selecione a empresa correspondente. Se a empresa ainda não existir, você pode cadastrá-la antes na aba **Empresas**.",
    category: "clientes",
    keywords: [
      "cliente",
      "contato",
      "cadastrar cliente",
      "vincular empresa",
      "telefone",
      "email",
    ],
    actionLink: {
      label: "Ir para Clientes",
      href: "/clientes",
    },
  },
  {
    id: "faq-metas-dashboard",
    question: "Como configurar metas de vendas para os consultores?",
    answer:
      "Acesse **Configurar Metas** pelo Dashboard ou pelo menu. Lá você pode definir a meta em **Valor (R$)** e **Volume (Kg ou unidades)** para cada vendedor e para o time geral. O progresso será calculado automaticamente nos gráficos e barras do Dashboard.",
    category: "metas",
    keywords: [
      "metas",
      "meta",
      "vendas",
      "volume",
      "valor",
      "vendedor",
      "dashboard",
      "progresso",
    ],
    actionLink: {
      label: "Configurar Metas",
      href: "/configurar-metas",
    },
  },
  {
    id: "faq-equipe-online",
    question: "Como funciona o status de presença (online/offline) da equipe?",
    answer:
      "Na tela de **Equipe** e no topo do **Kanban**, cada usuário possui um avatar com uma bolinha indicadora. A bolinha **verde com pulso** indica que o usuário está ativo/online, e a bolinha cinza indica status offline.",
    category: "equipe",
    keywords: [
      "online",
      "offline",
      "bolinha",
      "presenca",
      "avatar",
      "status",
      "equipe",
      "usuario",
    ],
    actionLink: {
      label: "Ver Equipe",
      href: "/equipe",
    },
  },
  {
    id: "faq-pesquisa-mercado",
    question: "Para que serve o módulo de Pesquisa de Mercado?",
    answer:
      "O módulo de **Pesquisa** permite criar questionários e registrar dados coletados em visitas técnicas a fazendas e criadouros de camarão/peixes (preços de insumos, marcas concorrentes, demanda e percepção de qualidade).",
    category: "pesquisa",
    keywords: [
      "pesquisa",
      "mercado",
      "formulario",
      "concorrencia",
      "preco",
      "fazenda",
      "coleta",
    ],
    actionLink: {
      label: "Acessar Pesquisa",
      href: "/pesquisa",
    },
  },
  {
    id: "faq-dashboard-filtros",
    question:
      "Como filtrar as métricas do Dashboard por período e responsável?",
    answer:
      "No topo do **Dashboard**, use os seletores **'Este mês'** (permite alternar entre Este mês, Este trimestre, Este ano ou Todo o período) e **'Responsável'** (para filtrar por vendedor específico) e **'Status'** para analisar o funil.",
    category: "metas",
    keywords: [
      "dashboard",
      "filtro",
      "periodo",
      "mes",
      "trimestre",
      "responsavel",
      "metricas",
    ],
    actionLink: {
      label: "Ir para o Dashboard",
      href: "/dashboard",
    },
  },
];

export const INITIAL_SUGGESTIONS = [
  "Como fazer check-in com GPS na visita?",
  "Como criar um quadro no Kanban?",
  "Como cadastrar um novo cliente?",
  "Como configurar metas de vendas?",
  "Quais atalhos rápidos eu posso usar?",
];

/**
 * Intelligent response matcher for Lia AI Assistant
 */
export function getLiaResponse(userText: string): {
  text: string;
  actions?: Array<{ label: string; href?: string; actionKey?: string }>;
  suggestedQuestions?: string[];
} {
  const query = userText.toLowerCase().trim();

  // Greetings
  if (
    query.startsWith("oi") ||
    query.startsWith("olá") ||
    query.startsWith("ola") ||
    query.startsWith("bom dia") ||
    query.startsWith("boa tarde") ||
    query.startsWith("boa noite") ||
    query === "e ai" ||
    query === "e aí" ||
    query === "hey"
  ) {
    return {
      text: "Olá. Sou a **Lia**, assistente do LarviFort CRM. Posso ajudar com agenda, clientes, metas, Kanban e uso da plataforma.",
      actions: [
        { label: "Ir para o Kanban", href: "/kanban" },
        { label: "Abrir Agenda", href: "/agenda" },
        { label: "Ver Dashboard", href: "/dashboard" },
      ],
      suggestedQuestions: [
        "Como funciona o check-in GPS?",
        "Como criar regras no Kanban?",
        "Como cadastrar clientes e empresas?",
      ],
    };
  }

  // Check-in / GPS / Visita / Localização
  if (
    query.includes("checkin") ||
    query.includes("check-in") ||
    query.includes("gps") ||
    query.includes("localiza") ||
    query.includes("visita") ||
    query.includes("coordenada")
  ) {
    return {
      text: "**Check-in de visita**:\n\n1. Acesse **Agenda**.\n2. Localize o compromisso.\n3. Clique em **Fazer Check-in**.\n4. Autorize a localização no navegador.\n5. O CRM registra coordenadas e horário para comprovação da visita.",
      actions: [
        { label: "Abrir Agenda de Visitas", href: "/agenda" },
        { label: "Ver Clientes", href: "/clientes" },
      ],
      suggestedQuestions: [
        "Como agendar um novo compromisso?",
        "Como criar tarefa a partir de visita?",
      ],
    };
  }

  // Kanban / Quadros / Tarefas / Cards / Colunas
  if (
    query.includes("kanban") ||
    query.includes("quadro") ||
    query.includes("tarefa") ||
    query.includes("card") ||
    query.includes("coluna") ||
    query.includes("bastao") ||
    query.includes("bastão")
  ) {
    return {
      text: "📋 **Quadro Kanban & Gestão de Tarefas**:\n\n• **Mover cards**: Arraste e solte tarefas entre as colunas.\n• **Novo quadro**: Use o botão de projetos no topo para criar via assistente ou template.\n• **Regras do Quadro**: Defina colunas obrigatórias e travas de avanço.\n• **Automações**: Crie gatilhos automáticos para quando cards forem concluídos ou compromissos forem criados.\n• **Passagem de Bastão**: Garanta checklist preenchido antes de transferir a responsabilidade.",
      actions: [
        { label: "Ir para o Quadro Kanban", href: "/kanban" },
        { label: "Ver Dashboard", href: "/dashboard" },
      ],
      suggestedQuestions: [
        "Como funcionam as automações do Kanban?",
        "O que é passagem de bastão?",
      ],
    };
  }

  // Agenda / Compromissos / Reunião
  if (
    query.includes("agenda") ||
    query.includes("compromisso") ||
    query.includes("reuniao") ||
    query.includes("reunião") ||
    query.includes("calendario") ||
    query.includes("calendário")
  ) {
    return {
      text: "📅 **Agenda Comercial & Compromissos**:\n\n• **Visualizações**: Alterne entre Mês, Semana, Dia e Lista.\n• **Novo Compromisso**: Clique em 'Novo Compromisso' para vincular data, cliente, tipo (Visita, Reunião, Ligação) e responsável.\n• **Check-in GPS**: Registre sua presença no local do cliente com 1 clique.\n• **Status**: Acompanhe pendentes, confirmados e realizados.",
      actions: [
        { label: "Abrir Agenda", href: "/agenda" },
        { label: "Cadastrar Cliente", href: "/clientes" },
      ],
      suggestedQuestions: [
        "Como fazer check-in com GPS?",
        "Como vincular empresa à visita?",
      ],
    };
  }

  // Clientes / Contatos / Leads
  if (
    query.includes("cliente") ||
    query.includes("contato") ||
    query.includes("lead") ||
    query.includes("telefone") ||
    query.includes("email") ||
    query.includes("whatsapp")
  ) {
    return {
      text: "👥 **Gestão de Clientes & Contatos**:\n\n• Acesse a seção **Clientes & Contatos** para visualizar sua carteira de produtores e compradores.\n• Cadastre telefones, e-mails, endereços e empresa vinculada.\n• Veja a data da última compra e última visita realizada no histórico detalhado.",
      actions: [
        { label: "Acessar Clientes & Contatos", href: "/clientes" },
        { label: "Gerenciar Empresas", href: "/empresas" },
      ],
      suggestedQuestions: [
        "Como cadastrar uma empresa?",
        "Como agendar visita para um cliente?",
      ],
    };
  }

  // Empresas / CNPJ / Fazendas
  if (
    query.includes("empresa") ||
    query.includes("cnpj") ||
    query.includes("fazenda") ||
    query.includes("distribuidor") ||
    query.includes("parceiro")
  ) {
    return {
      text: "🏢 **Gestão de Empresas & Fazendas**:\n\n• No módulo **Empresas**, gerencie produtores de larvas, fazendas de engorda, distribuidoras e parceiros.\n• Registre CNPJ, razão social, segmento e relacione múltiplos contatos à mesma organização.",
      actions: [
        { label: "Ir para Empresas", href: "/empresas" },
        { label: "Ver Clientes", href: "/clientes" },
      ],
      suggestedQuestions: [
        "Como cadastrar contatos de uma empresa?",
        "Como ver visitas realizadas por empresa?",
      ],
    };
  }

  // Metas / Vendas / Volume / Faturamento
  if (
    query.includes("meta") ||
    query.includes("venda") ||
    query.includes("volume") ||
    query.includes("faturamento") ||
    query.includes("receita") ||
    query.includes("conversao") ||
    query.includes("conversão")
  ) {
    return {
      text: "🎯 **Metas & Performance de Vendas**:\n\n• Acesse **Configurar Metas** para estipular metas mensais em R$ (faturamento) e em Volume (Kg ou unidades).\n• Acompanhe o percentual atingido individualmente por vendedor e o total da equipe nos gráficos dinâmicos do **Dashboard**.",
      actions: [
        { label: "Configurar Metas de Vendas", href: "/configurar-metas" },
        { label: "Ver Gráficos no Dashboard", href: "/dashboard" },
      ],
      suggestedQuestions: [
        "Onde vejo o ranking de vendas?",
        "Como filtrar o Dashboard por mês?",
      ],
    };
  }

  // Dashboard / Métricas / Relatórios
  if (
    query.includes("dashboard") ||
    query.includes("metrica") ||
    query.includes("métrica") ||
    query.includes("grafico") ||
    query.includes("gráfico") ||
    query.includes("relatorio") ||
    query.includes("relatório")
  ) {
    return {
      text: "**Dashboard e métricas comerciais**:\n\n• Tarefas da equipe por status.\n• Metas realizadas e planejadas.\n• Frequência de visitas e histórico de clientes.\n• Filtros por período e responsável.",
      actions: [
        { label: "Abrir Dashboard", href: "/dashboard" },
        { label: "Configurar Metas", href: "/configurar-metas" },
      ],
      suggestedQuestions: [
        "Como filtrar o Dashboard por consultor?",
        "Como ver as tarefas concluídas?",
      ],
    };
  }

  // Equipe / Usuários / Online / Permissões
  if (
    query.includes("equipe") ||
    query.includes("time") ||
    query.includes("usuario") ||
    query.includes("usuário") ||
    query.includes("online") ||
    query.includes("permissao") ||
    query.includes("permissão") ||
    query.includes("admin")
  ) {
    return {
      text: "👥 **Equipe & Usuários**:\n\n• No módulo **Equipe**, você visualiza os times formados e todos os membros.\n• Cada membro possui um indicador de presença: 🟢 **Verde** para online e ⚪ **Cinza** para offline.\n• Administradores podem criar novos times, convidar usuários e alternar papéis entre **ADMIN** e **USER**.",
      actions: [
        { label: "Acessar Equipe", href: "/equipe" },
        { label: "Ver Meu Perfil", href: "/perfil" },
      ],
      suggestedQuestions: [
        "Como criar um novo time?",
        "Como funciona a bolinha de status online?",
      ],
    };
  }

  // Pesquisa / Formulário de Mercado
  if (
    query.includes("pesquisa") ||
    query.includes("formulario") ||
    query.includes("formulário") ||
    query.includes("mercado") ||
    query.includes("preco") ||
    query.includes("preço")
  ) {
    return {
      text: "📝 **Pesquisas de Mercado & Coleta de Campo**:\n\n• Crie questionários técnicos e mercadológicos para aplicação durante as visitas a criadores de camarão e peixes.\n• Registre respostas sobre concorrentes, preços de insumos, linhagens de pós-larvas e satisfação.",
      actions: [
        { label: "Abrir Pesquisas de Mercado", href: "/pesquisa" },
        { label: "Nova Visita na Agenda", href: "/agenda" },
      ],
      suggestedQuestions: [
        "Como criar uma nova pesquisa?",
        "Como ver os resultados das pesquisas?",
      ],
    };
  }

  // Notificações
  if (
    query.includes("notifica") ||
    query.includes("alerta") ||
    query.includes("aviso") ||
    query.includes("sino")
  ) {
    return {
      text: "🔔 **Central de Notificações**:\n\n• Clique no ícone de sino na barra superior ou na sidebar para ver todos os seus alertas em tempo real.\n• Você é avisado sobre novas tarefas atribuídas, automações disparadas e lembretes de compromissos.",
      actions: [{ label: "Ver Dashboard", href: "/dashboard" }],
      suggestedQuestions: [
        "Como funcionam as automações?",
        "Como agendar um lembrete?",
      ],
    };
  }

  // Default fallback with helpful matching
  // Check if any FAQ keyword matches
  const matchedFaq = LIA_FAQ_LIST.find((faq) =>
    faq.keywords.some((kw) => query.includes(kw)),
  );

  if (matchedFaq) {
    return {
      text: `💡 **${matchedFaq.question}**\n\n${matchedFaq.answer}`,
      actions: matchedFaq.actionLink
        ? [
            {
              label: matchedFaq.actionLink.label,
              href: matchedFaq.actionLink.href,
            },
          ]
        : undefined,
      suggestedQuestions: [
        "Como funciona o check-in GPS?",
        "Como criar regras no Kanban?",
        "Onde configuro metas de vendas?",
      ],
    };
  }

  return {
    text: `Entendi sua dúvida sobre **"${userText}"**! 😊\n\nComo sou a assistente virtual do **LarviFort CRM**, posso te guiar em qualquer fluxo do sistema. Escolha um dos atalhos abaixo ou selecione uma dúvida frequente para eu te explicar o passo a passo:`,
    actions: [
      { label: "Quadro Kanban", href: "/kanban" },
      { label: "Agenda & Check-in", href: "/agenda" },
      { label: "Clientes & Contatos", href: "/clientes" },
      { label: "Configurar Metas", href: "/configurar-metas" },
    ],
    suggestedQuestions: [
      "Como fazer check-in com GPS?",
      "Como criar um novo quadro?",
      "Como cadastrar um cliente?",
      "Como configurar metas?",
    ],
  };
}
