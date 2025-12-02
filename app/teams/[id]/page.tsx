import { createClient } from "@/lib/supabase/server";
import {notFound, redirect} from "next/navigation";
import { Suspense } from "react";
import TeamMemberForm from "@/components/team-member-form";
import { Button } from "@/components/ui/button";
import { DeleteTeamButton } from "@/components/delete-team-button";
import { RotatePairsButton } from "@/components/rotate-pairs-button";

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

  const { data: members } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', id);

  return (
    <div className="flex-1 w-full flex flex-col gap-6">
      {/* Header with team name and actions */}
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl text-gray-900 dark:text-gray-100">{team.name}</h1>
        <div className="flex gap-2">
          <RotatePairsButton teamId={id} />
          <DeleteTeamButton teamId={id} />
        </div>
      </div>

      {/* Main content area with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Team Members */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900">
            <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-4">
              Team Members ({members?.length || 0})
            </h2>
            {members && members.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                  >
                    {member.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No team members yet.</p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <TeamMemberForm teamId={id} userId={user.id} />
            </div>
          </div>
        </aside>

        {/* Main area - Pairs */}
        <main className="lg:col-span-3 space-y-4">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
                Current Pairs
              </h2>
              <Button variant="outline" size="sm">
                Add Pair
              </Button>
            </div>

            {/* Pairs list placeholder */}
            <div className="space-y-4">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No pairs yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Add team members and create pairs to get started
                </p>
              </div>
            </div>
          </div>

          {/* Pair history section */}
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-900">
            <h2 className="font-semibold text-xl text-gray-900 dark:text-gray-100 mb-4">
              Pair History
            </h2>
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No pairing history yet
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex-1 w-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading team...</p>
      </div>
    }>
      <TeamDetails params={params} />
    </Suspense>
  );
}
