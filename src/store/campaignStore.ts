import { useState, useCallback } from "react";
import type { Campaign, Participant, ParticipantStatus } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Réunion produit Q2",
    meetingDate: "2026-04-14",
    meetingTime: "10:00",
    description: "Revue des objectifs produit pour le Q2",
    status: "DRAFT",
    createdAt: "2026-04-10T09:00:00Z",
    participants: [
      { id: "p1", name: "Sarah Martin", phone: "+33612345678", status: "PENDING" },
      { id: "p2", name: "Jean Dupont", phone: "+33698765432", status: "PENDING" },
      { id: "p3", name: "Marie Leclerc", phone: "+33611223344", status: "PENDING" },
    ],
  },
  {
    id: "2",
    name: "Stand-up Engineering",
    meetingDate: "2026-04-15",
    meetingTime: "09:30",
    description: "Daily stand-up de l'équipe engineering",
    status: "DRAFT",
    createdAt: "2026-04-11T08:00:00Z",
    participants: [
      { id: "p6", name: "Alex Chen", phone: "+33612340000", status: "PENDING" },
      { id: "p7", name: "Laura Kim", phone: "+33698760000", status: "PENDING" },
    ],
  },
];

let globalCampaigns = DEMO_CAMPAIGNS;

export function useCampaignStore() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(globalCampaigns);

  const updateGlobal = useCallback((updated: Campaign[]) => {
    globalCampaigns = updated;
    setCampaigns(updated);
  }, []);

  const addCampaign = useCallback((campaign: Omit<Campaign, "id" | "createdAt" | "participants" | "status">) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      participants: [],
      status: "DRAFT",
    };
    updateGlobal([newCampaign, ...globalCampaigns]);
    return newCampaign;
  }, [updateGlobal]);

  const addParticipant = useCallback((campaignId: string, participant: Omit<Participant, "id" | "status">) => {
    const updated = globalCampaigns.map((c) =>
      c.id === campaignId
        ? { ...c, participants: [...c.participants, { ...participant, id: Date.now().toString(), status: "PENDING" as const }] }
        : c
    );
    updateGlobal(updated);
  }, [updateGlobal]);

  const removeParticipant = useCallback((campaignId: string, participantId: string) => {
    const updated = globalCampaigns.map((c) =>
      c.id === campaignId
        ? { ...c, participants: c.participants.filter((p) => p.id !== participantId) }
        : c
    );
    updateGlobal(updated);
  }, [updateGlobal]);

  const updateParticipantStatus = useCallback((campaignId: string, participantId: string, status: ParticipantStatus) => {
    const updated = globalCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            participants: c.participants.map((p) =>
              p.id === participantId ? { ...p, status, ...(status === "CALLING" ? { calledAt: new Date().toISOString() } : {}), ...(["CONFIRMED", "DECLINED", "NO_ANSWER", "CALLBACK"].includes(status) ? { respondedAt: new Date().toISOString() } : {}) } : p
            ),
          }
        : c
    );
    updateGlobal(updated);
  }, [updateGlobal]);

  const launchCampaign = useCallback(async (campaignId: string) => {
    const campaign = globalCampaigns.find((c) => c.id === campaignId);
    if (!campaign || campaign.participants.length === 0) return;

    // Set all to CALLING
    const updated = globalCampaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            status: "ACTIVE" as const,
            participants: c.participants.map((p) => ({
              ...p,
              status: "CALLING" as const,
              calledAt: new Date().toISOString(),
            })),
          }
        : c
    );
    updateGlobal(updated);

    // Call Vapi via edge function
    try {
      const { data, error } = await supabase.functions.invoke("vapi-call", {
        body: {
          participants: campaign.participants.map((p) => ({
            phoneNumber: p.phone,
            participantName: p.name,
            campaignName: campaign.name,
            meetingDate: campaign.meetingDate,
            meetingTime: campaign.meetingTime,
          })),
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erreur lors du lancement des appels");
        return;
      }

      console.log("Vapi call results:", data);

      // Update statuses based on results
      if (data?.results) {
        const campaignNow = globalCampaigns.find((c) => c.id === campaignId);
        if (!campaignNow) return;

        const updatedAfterCall = globalCampaigns.map((c) => {
          if (c.id !== campaignId) return c;
          return {
            ...c,
            participants: c.participants.map((p) => {
              const result = data.results.find((r: any) => r.phoneNumber === p.phone);
              if (!result) return p;
              if (!result.success) {
                return { ...p, status: "NO_ANSWER" as const, respondedAt: new Date().toISOString() };
              }
              // Call initiated successfully - stays as CALLING until webhook updates
              return p;
            }),
          };
        });
        updateGlobal(updatedAfterCall);

        const successCount = data.results.filter((r: any) => r.success).length;
        const failCount = data.results.filter((r: any) => !r.success).length;

        if (successCount > 0) {
          toast.success(`${successCount} appel${successCount > 1 ? "s" : ""} lancé${successCount > 1 ? "s" : ""} avec succès`);
        }
        if (failCount > 0) {
          toast.error(`${failCount} appel${failCount > 1 ? "s" : ""} échoué${failCount > 1 ? "s" : ""}`);
        }
      }
    } catch (err) {
      console.error("Launch campaign error:", err);
      toast.error("Erreur de connexion au service d'appels");
    }
  }, [updateGlobal]);

  return { campaigns, addCampaign, addParticipant, removeParticipant, launchCampaign, updateParticipantStatus };
}
