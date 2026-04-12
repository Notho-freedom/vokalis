import type { Campaign } from "@/types/campaign";
import { Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

function StatCard({ label, value, total, icon, color, delay }: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={color}>{icon}</span>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="font-heading text-3xl font-bold text-foreground">{value}</span>
        <span className="mb-1 text-sm text-muted-foreground">/ {total}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6 }}
          className={`h-full rounded-full ${color.replace("text-", "bg-")}`}
        />
      </div>
    </motion.div>
  );
}

export function CampaignStats({ campaign }: { campaign: Campaign }) {
  const total = campaign.participants.length;
  const confirmed = campaign.participants.filter((p) => p.status === "CONFIRMED").length;
  const declined = campaign.participants.filter((p) => p.status === "DECLINED").length;
  const pending = campaign.participants.filter((p) => ["PENDING", "CALLING", "CALLBACK"].includes(p.status)).length;
  const noAnswer = campaign.participants.filter((p) => p.status === "NO_ANSWER").length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Total appelés" value={total - campaign.participants.filter(p => p.status === "PENDING").length} total={total} icon={<Phone className="h-4 w-4" />} color="text-primary" delay={0} />
      <StatCard label="Confirmés" value={confirmed} total={total} icon={<CheckCircle className="h-4 w-4" />} color="text-success" delay={0.05} />
      <StatCard label="Refusés" value={declined} total={total} icon={<XCircle className="h-4 w-4" />} color="text-destructive" delay={0.1} />
      <StatCard label="En attente" value={pending + noAnswer} total={total} icon={<Clock className="h-4 w-4" />} color="text-warning" delay={0.15} />
    </div>
  );
}
