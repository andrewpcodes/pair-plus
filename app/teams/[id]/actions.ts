'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Returns the ISO timestamp for the next rotation after `from` based on `schedule`. */
function nextRotationDate(schedule: string, from: Date = new Date()): string | null {
  const next = new Date(from);
  switch (schedule) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next.toISOString();
}

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

export async function rotatePairsAction(teamId: string, groupSize: number = 2) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('id, name')
    .eq('team_id', teamId);

  if (membersError) return { error: membersError.message };
  if (!members || members.length === 0) return { error: 'No team members' };

  // Delete existing pairs for this team
  const { data: existingPairs } = await supabase
    .from('pairs')
    .select('id')
    .eq('team_id', teamId);

  if (existingPairs && existingPairs.length > 0) {
    const pairIds = existingPairs.map((p) => p.id);
    await supabase.from('pair_members').delete().in('pair_id', pairIds);
    await supabase.from('pairs').delete().eq('team_id', teamId);
  }

  // Shuffle members using Fisher-Yates
  const shuffled = [...members];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Split into groups of groupSize
  const groups: typeof members[] = [];
  for (let i = 0; i < shuffled.length; i += groupSize) {
    groups.push(shuffled.slice(i, i + groupSize));
  }

  // If last group has only 1 member and there are other groups, merge it in
  if (groups.length > 1 && groups[groups.length - 1].length === 1) {
    const [lastMember] = groups.pop()!;
    groups[groups.length - 1].push(lastMember);
  }

  // Create pairs in DB
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    const pairName = `Pair ${i + 1}`;
    const { data: pair, error: pairError } = await supabase
      .from('pairs')
      .insert({ team_id: teamId, name: pairName, sort_order: i })
      .select('id')
      .single();

    if (pairError) return { error: pairError.message };

    const memberInserts = group.map((member) => ({
      pair_id: pair.id,
      member_id: member.id,
    }));

    const { error: memberError } = await supabase
      .from('pair_members')
      .insert(memberInserts);

    if (memberError) return { error: memberError.message };
  }

  // Update rotation settings with last rotated timestamp
  await supabase
    .from('rotation_settings')
    .upsert(
      { team_id: teamId, last_rotated_at: new Date().toISOString() },
      { onConflict: 'team_id' }
    );

  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function renamePair(pairId: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('pairs')
    .update({ name })
    .eq('id', pairId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePair(pairId: string, teamId: string) {
  const supabase = await createClient();
  await supabase.from('pair_members').delete().eq('pair_id', pairId);
  const { error } = await supabase.from('pairs').delete().eq('id', pairId);
  if (error) return { error: error.message };
  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function reorderPairs(teamId: string, pairIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    pairIds.map((id, index) =>
      supabase.from('pairs').update({ sort_order: index }).eq('id', id)
    )
  );
  return { success: true };
}

export async function moveMemberToPair(
  memberId: string,
  fromPairId: string | null,
  toPairId: string | null,
) {
  const supabase = await createClient();

  if (fromPairId) {
    await supabase
      .from('pair_members')
      .delete()
      .eq('pair_id', fromPairId)
      .eq('member_id', memberId);
  }

  if (toPairId) {
    await supabase
      .from('pair_members')
      .insert({ pair_id: toPairId, member_id: memberId });
  }

  return { success: true };
}

export async function addPair(teamId: string) {
  const supabase = await createClient();

  const { data: existingPairs } = await supabase
    .from('pairs')
    .select('sort_order')
    .eq('team_id', teamId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const maxOrder = existingPairs?.[0]?.sort_order ?? -1;
  const pairNumber = maxOrder + 2;

  const { data, error } = await supabase
    .from('pairs')
    .insert({ team_id: teamId, name: `Pair ${pairNumber}`, sort_order: maxOrder + 1 })
    .select('*')
    .single();

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function updateRotationSettings(
  teamId: string,
  settings: {
    schedule: string;
    group_size: number;
    enabled: boolean;
  }
) {
  const supabase = await createClient();

  let nextRotationAt: string | null = null;
  if (settings.enabled && settings.schedule !== 'manual') {
    nextRotationAt = nextRotationDate(settings.schedule);
  }

  const { error } = await supabase
    .from('rotation_settings')
    .upsert(
      {
        team_id: teamId,
        schedule: settings.schedule,
        group_size: settings.group_size,
        enabled: settings.enabled,
        next_rotation_at: nextRotationAt,
      },
      { onConflict: 'team_id' }
    );

  if (error) return { error: error.message };
  revalidatePath(`/teams/${teamId}`);
  return { success: true };
}

export async function checkAndRunScheduledRotation(teamId: string) {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('rotation_settings')
    .select('*')
    .eq('team_id', teamId)
    .maybeSingle();

  if (!settings?.enabled || !settings?.next_rotation_at) return { skipped: true };

  const nextRotation = new Date(settings.next_rotation_at);
  if (nextRotation > new Date()) return { skipped: true };

  await rotatePairsAction(teamId, settings.group_size);

  // Schedule next rotation
  const nextAt = nextRotationDate(settings.schedule);
  if (!nextAt) return { rotated: true };

  await supabase
    .from('rotation_settings')
    .update({ next_rotation_at: nextAt })
    .eq('team_id', teamId);

  return { rotated: true };
}
