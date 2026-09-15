"use client";

import { useEffect, useMemo, useState } from "react";
import {
  UsersThree,
  Plus,
  CaretDown,
  MagnifyingGlass,
  Trash,
  UserPlus,
} from "@phosphor-icons/react";
import NovoUsuarioModal from "@/components/equipe/NovoUsuarioModal";
import NovoTimeModal from "@/components/equipe/NovoTimeModal";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import {
  fetchUsers,
  fetchTeams,
  updateUser,
  deleteUser,
  deleteTeam,
  type User,
  type Team,
  type Role,
  roleLabel,
  ROLE_BADGE_CLASSES,
  getInitials,
  userAvatarBg,
  userAvatarTextColor,
} from "@/services/users";

export default function EquipePage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState<string | null>(null);
  const [novoUsuarioOpen, setNovoUsuarioOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tryCount, setTryCount] = useState(0);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "team" | "user"; id: string; name: string } | null>(null);

  const startLoad = () => setTryCount((c) => c + 1);

  // Load teams + users
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(false);
      try {
        const [teamsResult, usersResult] = await Promise.all([
          fetchTeams(),
          fetchUsers(),
        ]);
        if (cancelled) return;
        setTeams(teamsResult);
        setAllUsers(usersResult);
      } catch {
        if (cancelled) return;
        setError(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [tryCount]);

  const totalMembros = useMemo(
    () => allUsers.length,
    [allUsers]
  );

  // Group users by team
  const teamsWithMembers = useMemo(() => {
    const teamMap = new Map(teams.map((t) => [t.id, { ...t, members: [] as User[] }]));

    for (const user of allUsers) {
      if (user.teamId && teamMap.has(user.teamId)) {
        teamMap.get(user.teamId)!.members.push(user);
      }
    }

    // Add users without team to a special "Sem time" group if needed
    const semTime = allUsers.filter((u) => !u.teamId);
    if (semTime.length > 0) {
      teamMap.set("sem-time", {
        id: "sem-time",
        name: "Sem time",
        memberCount: semTime.length,
        createdAt: "",
        updatedAt: "",
        members: semTime,
      });
    }

    return Array.from(teamMap.values());
  }, [teams, allUsers]);

  const handleCreateTeam = async (createdTeam: Team) => {
    // Team is already added via onSuccess from modal, but we keep this for consistency
    setTeams((prev) => [...prev, createdTeam]);
  };

  const handleAddUser = async (createdUser: User) => {
    setAllUsers((prev) => [createdUser, ...prev]);
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteUser(memberId);
      setAllUsers((prev) => prev.filter((u) => u.id !== memberId));
    } catch {
      startLoad();
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam(teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      if (expanded === teamId) setExpanded(null);
    } catch {
      startLoad();
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await updateUser(userId, { role: newRole });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch {
      startLoad();
    }
  };

  if (loading) {
    return (
      <>
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Membros da equipe</h1>
            <div className="h-5 w-20 bg-slate-200 rounded-full animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-slate-200 rounded-full animate-pulse" />
        </header>
        <div className="px-6 py-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse h-20" />
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Membros da equipe</h1>
        </header>
        <div className="px-6 py-6 flex items-center justify-center min-h-[300px]">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-sm">
            <Trash size={32} className="text-red-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-red-700 mb-1">
              Não foi possível carregar a equipe
            </h3>
            <p className="text-xs text-red-600 mb-4">
              Verifique sua conexão ou tente novamente.
            </p>
            <button
              type="button"
              onClick={startLoad}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Membros da equipe</h1>
          <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full border border-slate-200">
            {totalMembros} membros
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar membro..."
              className="w-48 rounded-full border border-slate-200 bg-white px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <MagnifyingGlass
              size={16}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowNewTeam(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 transition-colors cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            Novo Time
          </button>
          <button
            type="button"
            onClick={() => setNovoUsuarioOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 transition-colors cursor-pointer"
          >
            <UserPlus size={16} weight="bold" />
            Novo Membro
          </button>
        </div>
      </header>

      <div className="px-6 py-6">
        {showNewTeam && (
          <NovoTimeModal
            open={showNewTeam}
            onClose={() => setShowNewTeam(false)}
            onSuccess={handleCreateTeam}
          />
        )}

        <div className="space-y-2">
          {teamsWithMembers.map((team) => {
            const isExpanded = expanded === team.id;
            const visibleMembers = team.members.slice(0, 4);
            const overflow = team.members.length - 4;

            return (
              <div key={team.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div
                  onClick={() => setExpanded(isExpanded ? null : team.id)}
                  className="flex w-full items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[15px] font-semibold text-slate-800">{team.name}</h3>
                    <div className="flex -space-x-2">
                      {visibleMembers.map((m) => (
                        <div
                          key={m.id}
                          className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                        >
                          <div
                            className={`flex h-full w-full items-center justify-center rounded-full ${userAvatarBg(m.role)} text-[11px] font-semibold ${userAvatarTextColor(m.role)}`}
                            title={`${m.firstName} ${m.lastName}`}
                          >
                            {getInitials(m.firstName, m.lastName)}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ring-2 ring-white ${
                              m.active ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                            aria-label={m.active ? "Online" : "Offline"}
                          />
                        </div>
                      ))}
                      {overflow > 0 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-semibold text-slate-500">
                          +{overflow}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">
                      {team.members.length} membro{team.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddMember(team.id);
                        setExpanded(team.id);
                      }}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Adicionar membro
                    </button>
                    {team.id !== "sem-time" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ type: "team", id: team.id, name: team.name });
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Excluir
                      </button>
                    )}
                    <CaretDown
                      size={18}
                      className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 pb-4">
                    {showAddMember === team.id && (
                      <NovoUsuarioModal
                        open={true}
                        onClose={() => setShowAddMember(null)}
                        onSuccess={(newUser) => handleAddUser({ ...newUser, teamId: team.id })}
                        teams={teams}
                      />
                    )}

                    {team.members.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        {team.id === "sem-time"
                          ? "Nenhum membro sem time"
                          : "Nenhum membro neste time."}
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {team.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-10 w-10 items-center justify-center rounded-full">
                                <div
                                  className={`flex h-full w-full items-center justify-center rounded-full ${userAvatarBg(member.role)} ${userAvatarTextColor(member.role)} text-sm font-semibold`}
                                >
                                  {getInitials(member.firstName, member.lastName)}
                                </div>
                                <span
                                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                                    member.active ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                  aria-label={member.active ? "Online" : "Offline"}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {member.firstName} {member.lastName}
                                </p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <select
                                value={member.role}
                                onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${ROLE_BADGE_CLASSES[member.role]}`}
                              >
                                {["ADMIN", "USER"].map((r) => (
                                  <option key={r} value={r}>
                                    {roleLabel(r as Role)}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget({ type: "user", id: member.id, name: `${member.firstName} ${member.lastName}` })}
                                className="rounded-full px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {teamsWithMembers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <UsersThree size={32} className="text-sky-500" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-slate-800">Nenhum time criado</h3>
            <p className="mb-4 text-sm text-slate-500">Crie seu primeiro time para organizar a equipe.</p>
            <button
              type="button"
              onClick={() => setShowNewTeam(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700 transition-colors cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              Criar Time
            </button>
          </div>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            const target = deleteTarget;
            if (!target) return;
            if (target.type === "team") {
              await handleDeleteTeam(target.id);
            } else {
              await handleDeleteMember(target.id);
            }
            setDeleteTarget(null);
          }}
          title={deleteTarget.type === "team" ? "Excluir time" : "Remover membro"}
          message={
            deleteTarget.type === "team"
              ? `Tem certeza que deseja excluir o time "${deleteTarget.name}"? Todos os membros ficarão sem time.`
              : `Tem certeza que deseja remover "${deleteTarget.name}" da equipe?`
          }
        />
      )}

      <NovoUsuarioModal
        open={novoUsuarioOpen}
        onClose={() => setNovoUsuarioOpen(false)}
        onSuccess={handleAddUser}
        teams={teams}
      />
    </>
  );
}