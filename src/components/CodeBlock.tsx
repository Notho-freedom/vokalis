import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, language = "bash", className }: { code: string; language?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={cn("relative rounded-lg border border-border bg-surface overflow-hidden group", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface-2">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-7 text-xs gap-1.5">
          {copied ? <Check className="w-3 h-3 text-brand-2" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copié" : "Copier"}
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
