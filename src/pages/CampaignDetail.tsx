import { useParams, useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/store/campaignStore";
import { StatusBadge } from "@/components/StatusBadge";
import { CampaignStats } from "@/components/CampaignStats";
import { AddParticipantDialog } from "@/components/AddParticipantDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Trash2, Calendar, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, addParticipant, removeParticipant, launchCampaign } = useCampaignStore();
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Campagne introuvable</p>
      </div>
    );
  }

  const handleLaunch = () => {
    if (campaign.participants.length === 0) {
      toast.error("Ajoutez au moins un participant");
      return;
    }
    launchCampaign(campaign.id);
    toast.success("Campagne lancée ! Les appels sont en cours...");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-glow">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="font-heading text-3xl font-bold text-foreground">{campaign.name}</h1>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {campaign.meetingDate}</span>
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {campaign.meetingTime}</span>
                </div>
                {campaign.description && <p className="mt-2 text-sm text-muted-foreground">{campaign.description}</p>}
              </div>

              {campaign.status === "DRAFT" && (
                <Button onClick={handleLaunch} className="gap-2 card-glow">
                  <Phone className="h-4 w-4" />
                  Lancer la campagne
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-12">
        {campaign.status !== "DRAFT" && (
          <div className="mb-8">
            <CampaignStats campaign={campaign} />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Participants ({campaign.participants.length})
          </h2>
          {campaign.status === "DRAFT" && (
            <AddParticipantDialog onAdd={(name, phone) => addParticipant(campaign.id, { name, phone })} />
          )}
        </div>

        {campaign.participants.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Aucun participant. Ajoutez-en pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaign.participants.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{p.phone}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {campaign.status === "DRAFT" && (
                        <button
                          onClick={() => removeParticipant(campaign.id, p.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
