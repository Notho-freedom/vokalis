
-- PROJECTS
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  text TEXT NOT NULL,
  voice TEXT,
  rate INTEGER DEFAULT 0,
  pitch INTEGER DEFAULT 0,
  audio_url TEXT,
  duration_seconds NUMERIC,
  is_public BOOLEAN NOT NULL DEFAULT false,
  slug TEXT UNIQUE,
  source TEXT NOT NULL DEFAULT 'playground',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public projects are viewable" ON public.projects FOR SELECT USING (is_public = true);
CREATE POLICY "Users insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_projects_user ON public.projects(user_id, created_at DESC);
CREATE INDEX idx_projects_slug ON public.projects(slug) WHERE is_public = true;

-- LAB PROJECTS
CREATE TABLE public.lab_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Session',
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lab_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own lab" ON public.lab_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own lab" ON public.lab_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own lab" ON public.lab_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own lab" ON public.lab_projects FOR DELETE USING (auth.uid() = user_id);

-- WEBHOOKS
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['tts.completed'],
  secret TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own webhooks" ON public.webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own webhooks" ON public.webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own webhooks" ON public.webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own webhooks" ON public.webhooks FOR DELETE USING (auth.uid() = user_id);

-- API KEYS: allowed origins
ALTER TABLE public.api_keys ADD COLUMN allowed_origins TEXT[] DEFAULT ARRAY[]::TEXT[];

-- API USAGE: replay id + duration
ALTER TABLE public.api_usage ADD COLUMN replay_id TEXT;
ALTER TABLE public.api_usage ADD COLUMN duration_ms INTEGER;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER projects_touch BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER lab_touch BEFORE UPDATE ON public.lab_projects FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-exports', 'audio-exports', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Audio exports public read" ON storage.objects FOR SELECT USING (bucket_id = 'audio-exports');
CREATE POLICY "Users upload own audio" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'audio-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own audio" ON storage.objects FOR DELETE USING (bucket_id = 'audio-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
