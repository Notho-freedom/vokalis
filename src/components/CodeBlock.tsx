import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({ code, language = "bash", className }: { code: string; language?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className={cn("relative border hairline bg-surface overflow-hidden group", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b hairline bg-surface-2">
        <span className="mono-label text-muted-foreground">{language}</span>
        <button onClick={onCopy} className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1.5">
          {copied ? <Check className="w-3 h-3 text-signal" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
