'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTeam(teamName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('teams')
    .insert({ user_id: user.id, name: teamName });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/teams`);
  return { success: true };
}
