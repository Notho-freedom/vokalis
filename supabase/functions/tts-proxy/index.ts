const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "x-used-voice",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TTS_BACKEND = Deno.env.get("TTS_BACKEND_URL") || "https://low-tts.onrender.com";

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Path after /tts-proxy
  const subPath = url.pathname.replace(/^.*\/tts-proxy/, "") || "/tts";

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing x-api-key header" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const hash = await sha256(apiKey);
  const { data: keyRow } = await supa
    .from("api_keys")
    .select("id, user_id, revoked_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (!keyRow || keyRow.revoked_at) {
    return new Response(JSON.stringify({ error: "Invalid or revoked API key" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Quota check (50k chars / month)
  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const { data: usageData } = await supa
    .from("api_usage")
    .select("characters")
    .eq("user_id", keyRow.user_id)
    .gte("created_at", monthStart.toISOString());
  const usedChars = (usageData || []).reduce((s, r: any) => s + (r.characters || 0), 0);
  const QUOTA = 50_000;

  let body: any = null;
  let chars = 0;
  let voice: string | null = null;

  if (req.method === "POST") {
    try {
      body = await req.json();
      chars = (body?.text || "").length;
      voice = body?.voice ?? null;
    } catch { body = null; }
  }

  if (subPath.startsWith("/tts") && usedChars + chars > QUOTA) {
    return new Response(JSON.stringify({ error: "Monthly quota exceeded", quota: QUOTA, used: usedChars }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Forward to backend
  const targetUrl = `${TTS_BACKEND}/api${subPath.startsWith("/") ? subPath : "/" + subPath}`;
  const fwdInit: RequestInit = {
    method: req.method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== null) fwdInit.body = JSON.stringify(body);

  const upstream = await fetch(targetUrl, fwdInit);
  const usedVoice = upstream.headers.get("X-Used-Voice");

  // Log usage
  await supa.from("api_usage").insert({
    user_id: keyRow.user_id,
    api_key_id: keyRow.id,
    endpoint: subPath.replace(/^\//, "").split("/")[0] || "tts",
    characters: chars,
    voice: voice,
    status: upstream.status,
  });
  await supa.from("api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", keyRow.id);

  const respHeaders = new Headers(corsHeaders);
  const ct = upstream.headers.get("content-type");
  if (ct) respHeaders.set("content-type", ct);
  if (usedVoice) respHeaders.set("x-used-voice", usedVoice);

  return new Response(upstream.body, { status: upstream.status, headers: respHeaders });
});
