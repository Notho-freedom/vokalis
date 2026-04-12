const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const CallSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  participantName: z.string().min(1, "Participant name is required"),
  campaignName: z.string().min(1, "Campaign name is required"),
  meetingDate: z.string().min(1, "Meeting date is required"),
  meetingTime: z.string().min(1, "Meeting time is required"),
});

const BatchSchema = z.object({
  participants: z.array(CallSchema).min(1, "At least one participant required"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const VAPI_API_KEY = Deno.env.get("VAPI_API_KEY");
    if (!VAPI_API_KEY) {
      throw new Error("VAPI_API_KEY is not configured");
    }

    const VAPI_ASSISTANT_ID = Deno.env.get("VAPI_ASSISTANT_ID");
    if (!VAPI_ASSISTANT_ID) {
      throw new Error("VAPI_ASSISTANT_ID is not configured");
    }

    const body = await req.json();
    const parsed = BatchSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const participant of parsed.data.participants) {
      try {
        const response = await fetch("https://api.vapi.ai/call/phone", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VAPI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assistantId: VAPI_ASSISTANT_ID,
            assistantOverrides: {
              firstMessage: `Bonjour ${participant.participantName}, je vous appelle de la part d'Aura concernant la réunion "${participant.campaignName}" prévue le ${participant.meetingDate} à ${participant.meetingTime}. Pouvez-vous confirmer votre présence ?`,
              variableValues: {
                participantName: participant.participantName,
                campaignName: participant.campaignName,
                meetingDate: participant.meetingDate,
                meetingTime: participant.meetingTime,
              },
            },
            customer: {
              number: participant.phoneNumber,
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error(`Vapi call failed for ${participant.phoneNumber}:`, JSON.stringify(data));
          results.push({
            phoneNumber: participant.phoneNumber,
            success: false,
            error: data.message || `Vapi API error [${response.status}]`,
          });
        } else {
          results.push({
            phoneNumber: participant.phoneNumber,
            success: true,
            callId: data.id,
          });
        }
      } catch (err) {
        console.error(`Error calling ${participant.phoneNumber}:`, err);
        results.push({
          phoneNumber: participant.phoneNumber,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("vapi-call error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
