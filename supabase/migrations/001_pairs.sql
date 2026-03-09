-- Pairs (groups) within a team
CREATE TABLE IF NOT EXISTS pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Pair',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members assigned to a pair
CREATE TABLE IF NOT EXISTS pair_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id UUID NOT NULL REFERENCES pairs(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  UNIQUE(pair_id, member_id)
);

-- Rotation schedule settings per team
CREATE TABLE IF NOT EXISTS rotation_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  schedule TEXT NOT NULL DEFAULT 'manual',
  group_size INTEGER NOT NULL DEFAULT 2,
  last_rotated_at TIMESTAMPTZ,
  next_rotation_at TIMESTAMPTZ,
  enabled BOOLEAN NOT NULL DEFAULT false
);

-- Row Level Security
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pair_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pairs"
  ON pairs FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage pair members for their teams"
  ON pair_members FOR ALL
  USING (pair_id IN (
    SELECT p.id FROM pairs p
    JOIN teams t ON p.team_id = t.id
    WHERE t.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage rotation settings for their teams"
  ON rotation_settings FOR ALL
  USING (team_id IN (SELECT id FROM teams WHERE user_id = auth.uid()));
