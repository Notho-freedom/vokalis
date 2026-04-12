import { useNavigate } from "react-router-dom";
import { useCampaignStore } from "@/store/campaignStore";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const statusStyle: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  ACTIVE: "bg-warning/15 text-warning border border-warning/30",
  COMPLETED: "bg-success/15 text-success border border-success/30",
};
const statusLabel: Record<string, string> = {
  DRAFT: "Brouillon",
  ACTIVE: "En cours",
  COMPLETED: "Terminée",
};

export default function Index() {
  const navigate = useNavigate();
  const { campaigns, addCampaign } = useCampaignStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-glow">
        <div className="mx-auto max-w-5xl px-6 pt-12 pb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-foreground">
                Aura <span className="text-gradient">Campaigns</span>
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Agent vocal intelligent — confirmez automatiquement la présence de vos participants
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Campagnes</h2>
          <CreateCampaignDialog onAdd={addCampaign} />
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-16 text-center">
            <p className="text-muted-foreground">Aucune campagne. Créez-en une pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c, i) => {
              const confirmed = c.participants.filter((p) => p.status === "CONFIRMED").length;
              return (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  onClick={() => navigate(`/campaign/${c.id}`)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30 hover:card-glow"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-heading text-base font-semibold text-foreground truncate">{c.name}</h3>
                      <Badge className={statusStyle[c.status]} variant="outline">{statusLabel[c.status]}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {c.meetingDate}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {c.meetingTime}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {c.participants.length} participants</span>
                      {confirmed > 0 && (
                        <span className="text-success">{confirmed} confirmé{confirmed > 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
