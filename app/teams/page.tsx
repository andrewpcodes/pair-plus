// app/teams/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import TeamList from "@/components/team-list";
import CreateTeamButton from "@/components/create-team-button";

async function Teams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('teams')
    .select(`
    *,
    membersCount:team_members(count)
  `)
    .order('created_at', { ascending: false });

  const teams = data?.map(team => ({
    ...team,
    membersCount: team.membersCount?.[0]?.count ?? 0
  })) || [];


  return (
    <TeamList teams={teams} />
  );
}

export default function TeamsPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-gray-600">Manage your teams and collaborate with your organization.</p>
        </div>
        <CreateTeamButton />
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="animate-pulse text-gray-500">Loading teams...</div>
        </div>
      }>
        <Teams />
      </Suspense>
    </div>
  );
}
