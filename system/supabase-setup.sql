-- =====================================================
-- SUPABASE SETUP - Deadwire RPG System
-- =====================================================
-- À exécuter dans l'éditeur SQL de Supabase
-- (Dashboard > SQL Editor > New Query)
-- =====================================================

-- 1. Créer la table des personnages
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT,
  level INTEGER DEFAULT 1,
  hp INTEGER DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer un index pour rechercher par discord_user_id
CREATE INDEX IF NOT EXISTS idx_characters_discord_user 
  ON characters(discord_user_id);

-- 3. Activer Row Level Security (RLS)
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- 4. Politique : Tout le monde peut voir tous les personnages (lecture)
-- (Pour la vue MJ et pour que les joueurs puissent voir les autres personnages si nécessaire)
CREATE POLICY "Anyone can view characters"
  ON characters
  FOR SELECT
  TO public
  USING (true);

-- 5. Politique : Les utilisateurs peuvent créer leurs propres personnages
CREATE POLICY "Users can create own characters"
  ON characters
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 6. Politique : Les utilisateurs peuvent mettre à jour leurs propres personnages
CREATE POLICY "Users can update own characters"
  ON characters
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- 7. Politique : Les utilisateurs peuvent supprimer leurs propres personnages
CREATE POLICY "Users can delete own characters"
  ON characters
  FOR DELETE
  TO public
  USING (true);

-- 8. Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger pour appeler la fonction à chaque UPDATE
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- NOTES IMPORTANTES :
-- =====================================================
-- Les politiques RLS sont volontairement permissives (public = true)
-- car la sécurité est gérée côté client via Discord OAuth2
-- 
-- Si tu veux renforcer la sécurité côté Supabase :
-- 1. Active Supabase Auth (en plus de Discord)
-- 2. Stocke le mapping discord_user_id <-> supabase auth.uid
-- 3. Remplace les politiques par auth.uid() checks
-- =====================================================
