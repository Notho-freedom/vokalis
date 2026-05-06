-- API Keys table
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own api keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own api keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own api keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own api keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- API Usage table
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  characters INTEGER NOT NULL DEFAULT 0,
  voice TEXT,
  status INTEGER NOT NULL DEFAULT 200,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_usage_user_created ON public.api_usage(user_id, created_at DESC);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage" ON public.api_usage
  FOR SELECT USING (auth.uid() = user_id);
-- inserts only from service role (no policy)

-- Favorite voices
CREATE TABLE public.favorite_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_short_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, voice_short_name)
);

ALTER TABLE public.favorite_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites" ON public.favorite_voices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.favorite_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.favorite_voices
  FOR DELETE USING (auth.uid() = user_id);