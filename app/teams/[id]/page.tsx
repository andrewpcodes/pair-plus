import { createClient } from "@/lib/supabase/server";
import {notFound, redirect} from "next/navigation";
import { Suspense } from "react";
import TeamMemberForm from "@/components/team-member-form";

async function TeamDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
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
    <>
      <h1 className="font-bold text-3xl">{team.name}</h1>
      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl">Team Members</h2>
        {members && members.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <li key={member.id} className="px-4 py-2 border rounded">
                {member.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No team members yet.</p>
        )}
      </div>
      <TeamMemberForm teamId={id} userId={user.id} />
    </>
  );
}

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <Suspense fallback={<p>Loading team...</p>}>
        <TeamDetails params={params} />
      </Suspense>
    </div>
  );
}
