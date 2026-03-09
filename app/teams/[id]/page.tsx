import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import TeamMemberForm from "@/components/team-member-form";
import { DeleteTeamButton } from "@/components/delete-team-button";
import { PairsGrid } from "@/components/pairs-grid";
import { RotationSettingsPanel } from "@/components/rotation-settings-panel";
import { checkAndRunScheduledRotation } from "./actions";

async function TeamDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (!team) {
    notFound();
  }

  // Trigger any due scheduled rotation
  await checkAndRunScheduledRotation(id);

  const [membersResult, pairsResult, rotationResult] = await Promise.all([
    supabase
      .from('team_members')
      .select('id, name')
      .eq('team_id', id)
      .order('name', { ascending: true }),
    supabase
      .from('pairs')
      .select(`
        id,
        name,
        sort_order,
        pair_members (
          member:team_members ( id, name )
        )
      `)
      .eq('team_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('rotation_settings')
      .select('*')
      .eq('team_id', id)
      .maybeSingle(),
  ]);

  const members = membersResult.data ?? [];

  // Flatten nested pair_members into a clean members array
  const pairs = (pairsResult.data ?? []).map((pair) => ({
    id: pair.id,
    name: pair.name,
    sort_order: pair.sort_order,
    members: (pair.pair_members ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((pm: any) => pm.member)
      .filter(Boolean) as { id: string; name: string }[],
  }));

  const assignedIds = new Set(pairs.flatMap((p) => p.members.map((m) => m.id)));
  const unassignedMembers = members.filter((m) => !assignedIds.has(m.id));

  const rotationSettings = rotationResult.data ?? {
    schedule: 'manual' as const,
    group_size: 2,
    last_rotated_at: null,
    next_rotation_at: null,
    enabled: false,
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-3xl text-gray-900 dark:text-gray-100">{team.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        <DeleteTeamButton teamId={id} />
      </div>

      {/* Content: sidebar + main */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Rotation settings */}
          <RotationSettingsPanel teamId={id} initialSettings={rotationSettings} />

          {/* Team members list */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Team Members ({members.length})
            </h2>
            {members.length > 0 ? (
              <ul className="flex flex-col gap-1.5 mb-4">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="px-3 py-2 border border-gray-100 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                    {member.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">No team members yet.</p>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <TeamMemberForm teamId={id} userId={user.id} />
            </div>
          </div>
        </aside>

        {/* Main pairs area */}
        <main className="lg:col-span-3">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-white dark:bg-gray-900">
            <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-6">
              Current Pairs
            </h2>
            <PairsGrid
              teamId={id}
              initialPairs={pairs}
              unassignedMembers={unassignedMembers}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="flex-1 w-full flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading team…</p>
        </div>
      }
    >
      <TeamDetails params={params} />
    </Suspense>
  );
}

