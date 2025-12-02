'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTeamMember(teamId: string, userId: string, name: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('team_members')
    .insert({ team_id: teamId, user_id: userId, name });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}
