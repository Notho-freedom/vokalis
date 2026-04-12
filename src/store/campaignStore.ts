import { useState, useCallback } from "react";
import type { Campaign, Participant, ParticipantStatus } from "@/types/campaign";

const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Réunion produit Q2",
    meetingDate: "2026-04-14",
    meetingTime: "10:00",
    description: "Revue des objectifs produit pour le Q2",
    status: "ACTIVE",
    createdAt: "2026-04-10T09:00:00Z",
    participants: [
      { id: "p1", name: "Sarah Martin", phone: "+33612345678", status: "CONFIRMED", calledAt: "2026-04-11T14:00:00Z", respondedAt: "2026-04-11T14:01:00Z" },
      { id: "p2", name: "Jean Dupont", phone: "+33698765432", status: "DECLINED", calledAt: "2026-04-11T14:05:00Z", respondedAt: "2026-04-11T14:06:00Z" },
      { id: "p3", name: "Marie Leclerc", phone: "+33611223344", status: "PENDING" },
      { id: "p4", name: "Paul Moreau", phone: "+33655667788", status: "CALLING" },
      { id: "p5", name: "Claire Bernard", phone: "+33699887766", status: "NO_ANSWER", calledAt: "2026-04-11T14:10:00Z" },
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
  {
    id: "3",
    name: "Board Meeting",
    meetingDate: "2026-04-16",
    meetingTime: "14:00",
    status: "COMPLETED",
    createdAt: "2026-04-08T10:00:00Z",
    participants: [
      { id: "p8", name: "Marc Olivier", phone: "+33612341111", status: "CONFIRMED", calledAt: "2026-04-09T10:00:00Z", respondedAt: "2026-04-09T10:01:00Z" },
      { id: "p9", name: "Nadia Boucher", phone: "+33698761111", status: "CONFIRMED", calledAt: "2026-04-09T10:05:00Z", respondedAt: "2026-04-09T10:06:00Z" },
      { id: "p10", name: "Thierry Blanc", phone: "+33611221111", status: "DECLINED", calledAt: "2026-04-09T10:10:00Z", respondedAt: "2026-04-09T10:11:00Z" },
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

  const launchCampaign = useCallback((campaignId: string) => {
    const updated = globalCampaigns.map((c) => {
      if (c.id !== campaignId) return c;
      return {
        ...c,
        status: "ACTIVE" as const,
        participants: c.participants.map((p) => ({
          ...p,
          status: "CALLING" as const,
          calledAt: new Date().toISOString(),
        })),
      };
    });
    updateGlobal(updated);

    // Simulate responses after delays
    const campaign = updated.find((c) => c.id === campaignId);
    if (!campaign) return;

    campaign.participants.forEach((p, i) => {
      setTimeout(() => {
        const statuses: ParticipantStatus[] = ["CONFIRMED", "DECLINED", "NO_ANSWER", "CONFIRMED", "CALLBACK"];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const now = globalCampaigns.map((c) =>
          c.id === campaignId
            ? {
                ...c,
                participants: c.participants.map((pp) =>
                  pp.id === p.id ? { ...pp, status: randomStatus, respondedAt: new Date().toISOString() } : pp
                ),
              }
            : c
        );
        updateGlobal(now);
      }, 2000 + i * 1500);
    });
  }, [updateGlobal]);

  return { campaigns, addCampaign, addParticipant, removeParticipant, launchCampaign };
}
