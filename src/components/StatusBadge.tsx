import type { ParticipantStatus } from "@/types/campaign";
import { cn } from "@/lib/utils";

const statusConfig: Record<ParticipantStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-muted text-muted-foreground" },
  CALLING: { label: "Appel en cours", className: "bg-warning/15 text-warning border border-warning/30" },
  CONFIRMED: { label: "Confirmé", className: "bg-success/15 text-success border border-success/30" },
  DECLINED: { label: "Refusé", className: "bg-destructive/15 text-destructive border border-destructive/30" },
  NO_ANSWER: { label: "Pas de réponse", className: "bg-muted text-muted-foreground border border-border" },
  CALLBACK: { label: "Rappeler", className: "bg-primary/15 text-primary border border-primary/30" },
};

export function StatusBadge({ status }: { status: ParticipantStatus }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {status === "CALLING" && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-warning opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
        </span>
      )}
      {config.label}
    </span>
  );
}
