import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface Props {
  onAdd: (data: { name: string; meetingDate: string; meetingTime: string; description?: string }) => void;
}

export function CreateCampaignDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date || !time) return;
    onAdd({ name: name.trim(), meetingDate: date, meetingTime: time, description: desc.trim() || undefined });
    setName(""); setDate(""); setTime(""); setDesc("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading">Créer une campagne</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de la réunion</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Réunion produit Q2" className="bg-muted border-border" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-muted border-border" />
            </div>
            <div className="space-y-2">
              <Label>Heure</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-muted border-border" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description (optionnel)</Label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Objectifs, contexte..." className="bg-muted border-border resize-none" rows={3} />
          </div>
          <Button type="submit" className="w-full">Créer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
