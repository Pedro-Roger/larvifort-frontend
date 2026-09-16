import { fetchTasks, type Task } from "./tasks";
import { fetchAppointments, type Appointment } from "./appointments";
import { fetchClients, type Cliente, type ClientsPage } from "./clients";
import { fetchEmpresas, type Empresa, type EmpresasPage } from "./companies";
import { fetchDashboardStats, type DashboardStats } from "./dashboard";
import { fetchUsers, type User } from "./users";

export interface LiveCRMContext {
  generatedAt: string;
  currentDateFormatted: string;
  summaryYesterday: {
    tasksCompleted: Array<{ id: string; title: string; assignee?: string }>;
    appointmentsDone: Array<{
      id: string;
      title: string;
      tipo: string;
      cliente?: string;
      hasCheckin: boolean;
    }>;
    totalCompletedTasks: number;
    totalCompletedVisits: number;
  };
  summaryToday: {
    appointments: Array<{
      id: string;
      title: string;
      tipo: string;
      horario?: string | null;
      cliente?: string | null;
      empresa?: string | null;
      hasCheckin: boolean;
    }>;
    tasksInProgress: Array<{ id: string; title: string; assignee?: string }>;
    totalTodayAppointments: number;
    totalInProgressTasks: number;
  };
  pendingActivities: {
    backlogCount: number;
    inProgressCount: number;
    inReviewCount: number;
    unassignedTasksCount: number;
    urgentTasks: Array<{ id: string; title: string; status: string; assignee?: string }>;
  };
  upcomingDates: Array<{
    date: string;
    title: string;
    tipo: string;
    clienteOrEmpresa?: string;
    daysUntil: number;
  }>;
  goalsAndSales: {
    receitaTotal: number;
    metaValor: number;
    percentValor: number;
    vendasMes: number;
    metaVolume: number;
    taxaConversao: number;
    topSellers: Array<{
      nome: string;
      receita: number;
      metaValor: number;
      percent: number;
    }>;
  };
  clientOverview: {
    totalClients: number;
    totalCompanies: number;
    recentClients: Array<{ id: string; name: string; companyId?: string }>;
    clientsNeedingContact: Array<{ id: string; name: string; daysSinceLastActivity: number }>;
  };
  teamOnline: {
    totalUsers: number;
    onlineCount: number;
    onlineNames: string[];
  };
}

/**
 * Helper to get ISO date (YYYY-MM-DD) in local time
 */
function getLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Builds a structured, rich snapshot of live CRM data to feed into the OpenRouter AI context.
 */
export async function buildLiveCRMContext(): Promise<LiveCRMContext> {
  const now = new Date();
  const todayStr = getLocalDateString(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // Fetch all live data safely with fallback on error
  const [tasksRes, appointmentsRes, clientsRes, companiesRes, statsRes, usersRes] =
    await Promise.allSettled([
      fetchTasks().catch(() => [] as Task[]),
      fetchAppointments().catch(() => [] as Appointment[]),
      fetchClients({ page: 1, pageSize: 100 }).catch(
        () => ({ items: [] as Cliente[], total: 0, page: 1, pageSize: 100 } as ClientsPage)
      ),
      fetchEmpresas({ page: 1, pageSize: 100 }).catch(
        () => ({ items: [] as Empresa[], total: 0, page: 1, pageSize: 100 } as EmpresasPage)
      ),
      fetchDashboardStats().catch(() => null as DashboardStats | null),
      fetchUsers().catch(() => [] as User[]),
    ]);

  const tasks: Task[] = tasksRes.status === "fulfilled" ? tasksRes.value : [];
  const appointments: Appointment[] =
    appointmentsRes.status === "fulfilled" ? appointmentsRes.value : [];
  const clients: Cliente[] =
    clientsRes.status === "fulfilled" && clientsRes.value ? clientsRes.value.items || [] : [];
  const companies: Empresa[] =
    companiesRes.status === "fulfilled" && companiesRes.value
      ? companiesRes.value.items || []
      : [];
  const stats: DashboardStats | null =
    statsRes.status === "fulfilled" ? statsRes.value : null;
  const users: User[] = usersRes.status === "fulfilled" ? usersRes.value : [];

  // 1. Resumo de Ontem
  const yesterdayTasksCompleted = tasks.filter((t) => {
    if (t.status !== "CONCLUIDO") return false;
    const updateDate = t.updatedAt ? t.updatedAt.slice(0, 10) : "";
    return updateDate === yesterdayStr;
  });

  const yesterdayAppointments = appointments.filter((a) => a.data === yesterdayStr);

  // 2. Resumo de Hoje
  const todayAppointments = appointments.filter((a) => a.data === todayStr);
  const todayInProgressTasks = tasks.filter((t) => t.status === "EM_ANDAMENTO");

  // 3. Atividades que Faltam (Backlog e Pendências)
  const backlogTasks = tasks.filter((t) => t.status === "BACKLOG");
  const reviewTasks = tasks.filter((t) => t.status === "EM_REVISAO");
  const unassignedTasks = tasks.filter((t) => !t.assigneeName && t.status !== "CONCLUIDO");

  // 4. Datas Importantes Próximas (Próximos 7 a 14 dias)
  const upcomingAppointments = appointments
    .filter((a) => {
      if (!a.data || a.data < todayStr) return false;
      const appDate = new Date(`${a.data}T00:00:00`);
      const diffTime = appDate.getTime() - new Date(`${todayStr}T00:00:00`).getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 14;
    })
    .sort((a, b) => (a.data > b.data ? 1 : -1))
    .slice(0, 8);

  const upcomingDatesFormatted = upcomingAppointments.map((a) => {
    const appDate = new Date(`${a.data}T00:00:00`);
    const diffTime = appDate.getTime() - new Date(`${todayStr}T00:00:00`).getTime();
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return {
      date: a.data,
      title: a.titulo,
      tipo: a.tipo,
      clienteOrEmpresa: a.clienteNome || a.empresaNome || "Não especificado",
      daysUntil: diffDays,
    };
  });

  // 5. Metas & Vendas
  const salesGeral = stats?.salesGeral;
  const metaValor = salesGeral?.metaValor || 150000;
  const receitaTotal = salesGeral?.receitaTotal || 0;
  const percentValor = metaValor > 0 ? Math.round((receitaTotal / metaValor) * 100) : 0;

  const topSellers = (stats?.salesPorPessoa || []).map((s) => ({
    nome: s.nome,
    receita: s.receita,
    metaValor: s.metaValor,
    percent: s.metaValor > 0 ? Math.round((s.receita / s.metaValor) * 100) : 0,
  }));

  // 6. Clientes & Empresas
  const clientActivity = stats?.clientActivity || [];
  const clientsNeedingContact = clientActivity
    .filter((ca) => ca.visitasMes === 0)
    .slice(0, 5)
    .map((ca) => ({
      id: ca.id,
      name: ca.cliente,
      daysSinceLastActivity: 30,
    }));

  // 7. Equipe Online
  const onlineUsers = users.filter((u) => u.active);

  return {
    generatedAt: now.toISOString(),
    currentDateFormatted: now.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    summaryYesterday: {
      tasksCompleted: yesterdayTasksCompleted.map((t) => ({
        id: t.id,
        title: t.titulo,
        assignee: t.assigneeName || undefined,
      })),
      appointmentsDone: yesterdayAppointments.map((a) => ({
        id: a.id,
        title: a.titulo,
        tipo: a.tipo,
        cliente: a.clienteNome || undefined,
        hasCheckin: Boolean(a.checkinAt),
      })),
      totalCompletedTasks: yesterdayTasksCompleted.length,
      totalCompletedVisits: yesterdayAppointments.length,
    },
    summaryToday: {
      appointments: todayAppointments.map((a) => ({
        id: a.id,
        title: a.titulo,
        tipo: a.tipo,
        horario: a.horario,
        cliente: a.clienteNome,
        empresa: a.empresaNome,
        hasCheckin: Boolean(a.checkinAt),
      })),
      tasksInProgress: todayInProgressTasks.map((t) => ({
        id: t.id,
        title: t.titulo,
        assignee: t.assigneeName || undefined,
      })),
      totalTodayAppointments: todayAppointments.length,
      totalInProgressTasks: todayInProgressTasks.length,
    },
    pendingActivities: {
      backlogCount: backlogTasks.length,
      inProgressCount: todayInProgressTasks.length,
      inReviewCount: reviewTasks.length,
      unassignedTasksCount: unassignedTasks.length,
      urgentTasks: tasks
        .filter((t) => t.status !== "CONCLUIDO")
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.titulo,
          status: t.status,
          assignee: t.assigneeName || undefined,
        })),
    },
    upcomingDates: upcomingDatesFormatted,
    goalsAndSales: {
      receitaTotal,
      metaValor,
      percentValor,
      vendasMes: salesGeral?.vendasMes || 0,
      metaVolume: salesGeral?.metaVolume || 0,
      taxaConversao: salesGeral?.taxaConversao || 0,
      topSellers,
    },
    clientOverview: {
      totalClients: clients.length,
      totalCompanies: companies.length,
      recentClients: clients.slice(0, 5).map((c) => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        companyId: c.empresaId || undefined,
      })),
      clientsNeedingContact,
    },
    teamOnline: {
      totalUsers: users.length,
      onlineCount: onlineUsers.length,
      onlineNames: onlineUsers.map((u) => `${u.firstName} ${u.lastName}`.trim()),
    },
  };
}

/**
 * Generates a prompt context string for the AI model
 */
export function formatCRMContextForPrompt(ctx: LiveCRMContext): string {
  return `
=== DADOS AO VIVO DO LARVIFORT CRM (${ctx.currentDateFormatted}) ===

1. RESUMO DO DIA ANTERIOR (ONTEM):
- Tarefas concluídas ontem: ${ctx.summaryYesterday.totalCompletedTasks} (${ctx.summaryYesterday.tasksCompleted.map((t) => t.title).join(", ") || "Nenhuma registrada"})
- Compromissos / Visitas de ontem: ${ctx.summaryYesterday.totalCompletedVisits} (${ctx.summaryYesterday.appointmentsDone.map((a) => `${a.title} [${a.hasCheckin ? "Check-in GPS Feito" : "Sem Check-in"}]`).join(", ") || "Nenhum"})

2. ATIVIDADES DE HOJE:
- Compromissos agendados para hoje: ${ctx.summaryToday.totalTodayAppointments}
${ctx.summaryToday.appointments.map((a) => `  • [${a.tipo}] ${a.title} às ${a.horario || "horário a definir"} | Cliente: ${a.cliente || "N/A"} | Check-in: ${a.hasCheckin ? "Realizado" : "Pendente"}`).join("\n") || "  • Nenhum compromisso na agenda hoje."}
- Tarefas em andamento hoje: ${ctx.summaryToday.totalInProgressTasks} tarefas

3. RESUMO DE ATIVIDADES QUE FALTAM (PENDÊNCIAS):
- Backlog: ${ctx.pendingActivities.backlogCount} tarefas
- Em Andamento: ${ctx.pendingActivities.inProgressCount} tarefas
- Em Revisão: ${ctx.pendingActivities.inReviewCount} tarefas
- Sem responsável atribuído: ${ctx.pendingActivities.unassignedTasksCount} tarefas
- Tarefas prioritárias pendentes: ${ctx.pendingActivities.urgentTasks.map((t) => `"${t.title}" (${t.status}, Resp: ${t.assignee || "Ninguém"})`).join(", ") || "Nenhuma pendente"}

4. DATAS IMPORTANTES PRÓXIMAS (PRÓXIMOS 7 A 14 DIAS):
${ctx.upcomingDates.map((u) => `• Em ${u.daysUntil} dia(s) (${u.date}): [${u.tipo}] ${u.title} - ${u.clienteOrEmpresa}`).join("\n") || "• Nenhum compromisso futuro nos próximos 14 dias."}

5. METAS & PERFORMANCE COMERCIAL DO MÊS:
- Faturamento Atual: R$ ${ctx.goalsAndSales.receitaTotal.toLocaleString("pt-BR")} / Meta: R$ ${ctx.goalsAndSales.metaValor.toLocaleString("pt-BR")} (${ctx.goalsAndSales.percentValor}% atingido)
- Vendas fechadas no mês: ${ctx.goalsAndSales.vendasMes}
- Taxa de conversão geral: ${ctx.goalsAndSales.taxaConversao}%
- Ranking de Consultores:
${ctx.goalsAndSales.topSellers.map((s) => `  • ${s.nome}: R$ ${s.receita.toLocaleString("pt-BR")} (${s.percent}% da meta)`).join("\n") || "  • Sem dados de vendedores."}

6. CARTEIRA DE CLIENTES & EMPRESAS:
- Total de Clientes: ${ctx.clientOverview.totalClients} | Total de Empresas/Fazendas: ${ctx.clientOverview.totalCompanies}
${ctx.clientOverview.clientsNeedingContact.length > 0 ? `- Clientes sem visita recente: ${ctx.clientOverview.clientsNeedingContact.map((c) => c.name).join(", ")}` : ""}

7. EQUIPE ONLINE:
- ${ctx.teamOnline.onlineCount} de ${ctx.teamOnline.totalUsers} usuários online agora (${ctx.teamOnline.onlineNames.join(", ") || "Nenhum"})
`;
}
