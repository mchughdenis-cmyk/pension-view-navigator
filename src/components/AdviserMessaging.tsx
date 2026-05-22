// MP.3 — IFA in-platform messaging, notes & review scheduling
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Calendar, StickyNote, Users } from "lucide-react";
import { toast } from "sonner";

interface Msg { id: string; from: "adviser" | "client" | "system"; body: string; createdAt: string; type: "message" | "note"; }
interface Note { id: string; clientId: string; type: string; body: string; isPrivate: boolean; createdAt: string; }
interface Review { id: string; clientId: string; scheduledAt: string; format: string; status: string; }

const CLIENTS = [
  { id: "c1", name: "Sarah Chen", unread: 2 },
  { id: "c2", name: "James Okafor", unread: 0 },
  { id: "c3", name: "Maria Rossi", unread: 1 },
  { id: "c4", name: "David Patel", unread: 0 },
];

const LS = (k: string) => `airgead.adviser.${k}`;

export default function AdviserMessaging() {
  const [activeId, setActiveId] = useState(CLIENTS[0].id);
  const [msgs, setMsgs] = useState<Record<string, Msg[]>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [body, setBody] = useState("");
  const [msgType, setMsgType] = useState<"message" | "note">("message");
  const [noteType, setNoteType] = useState("General");
  const [noteBody, setNoteBody] = useState("");
  const [notePrivate, setNotePrivate] = useState(false);
  const [reviewDate, setReviewDate] = useState("");
  const [reviewFormat, setReviewFormat] = useState("Video call");

  useEffect(() => {
    setMsgs(JSON.parse(localStorage.getItem(LS("msgs")) || "{}"));
    setNotes(JSON.parse(localStorage.getItem(LS("notes")) || "[]"));
    setReviews(JSON.parse(localStorage.getItem(LS("reviews")) || "[]"));
  }, []);
  useEffect(() => { localStorage.setItem(LS("msgs"), JSON.stringify(msgs)); }, [msgs]);
  useEffect(() => { localStorage.setItem(LS("notes"), JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem(LS("reviews"), JSON.stringify(reviews)); }, [reviews]);

  const thread = msgs[activeId] || [];
  const activeClient = CLIENTS.find((c) => c.id === activeId)!;
  const clientNotes = useMemo(() => notes.filter((n) => n.clientId === activeId), [notes, activeId]);
  const clientReviews = useMemo(() => reviews.filter((r) => r.clientId === activeId), [reviews, activeId]);
  const upcoming = reviews.filter((r) => new Date(r.scheduledAt) > new Date()).slice(0, 5);

  const send = () => {
    if (!body.trim()) return;
    const m: Msg = { id: crypto.randomUUID(), from: "adviser", body, createdAt: new Date().toISOString(), type: msgType };
    setMsgs((prev) => ({ ...prev, [activeId]: [...(prev[activeId] || []), m] }));
    setBody("");
    toast.success(msgType === "note" ? "Private note saved" : `Message sent to ${activeClient.name}`);
  };

  const addNote = () => {
    if (!noteBody.trim()) return;
    setNotes((n) => [{ id: crypto.randomUUID(), clientId: activeId, type: noteType, body: noteBody, isPrivate: notePrivate, createdAt: new Date().toISOString() }, ...n]);
    setNoteBody("");
    toast.success("Note added");
  };

  const scheduleReview = () => {
    if (!reviewDate) return;
    setReviews((r) => [...r, { id: crypto.randomUUID(), clientId: activeId, scheduledAt: reviewDate, format: reviewFormat, status: "scheduled" }]);
    setMsgs((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] || []),
        { id: crypto.randomUUID(), from: "system", body: `Annual review scheduled for ${new Date(reviewDate).toLocaleString("en-GB")} (${reviewFormat})`, createdAt: new Date().toISOString(), type: "message" },
      ],
    }));
    toast.success("Review scheduled — calendar invite sent");
    setReviewDate("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" /> Client communications
        </h1>
        <p className="text-sm text-muted-foreground">Message, note, and schedule reviews with your clients — all in one place.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Clients</CardTitle></CardHeader>
          <CardContent className="p-2 space-y-1">
            {CLIENTS.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left rounded-md px-3 py-2 text-sm flex items-center justify-between hover:bg-accent ${activeId === c.id ? "bg-accent" : ""}`}>
                {c.name}
                {c.unread > 0 && <Badge>{c.unread}</Badge>}
              </button>
            ))}
            <div className="border-t mt-2 pt-2">
              <div className="text-xs text-muted-foreground px-3 pb-1">Upcoming reviews</div>
              {upcoming.length === 0 && <div className="text-xs text-muted-foreground px-3">None scheduled</div>}
              {upcoming.map((r) => (
                <div key={r.id} className="text-xs px-3 py-1">
                  {CLIENTS.find((c) => c.id === r.clientId)?.name} — {new Date(r.scheduledAt).toLocaleString("en-GB")}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">{activeClient.name}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-[340px] overflow-y-auto space-y-2 rounded-md bg-muted/30 p-3">
              {thread.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No messages yet.</p>}
              {thread.map((m) => (
                <div key={m.id} className={`flex ${m.from === "adviser" ? "justify-end" : m.from === "system" ? "justify-center" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    m.from === "adviser" ? "bg-primary text-primary-foreground"
                    : m.from === "system" ? "bg-secondary text-muted-foreground text-xs px-3 rounded-full"
                    : "bg-card border"
                  }`}>
                    {m.type === "note" && <Badge variant="secondary" className="mb-1">Private note</Badge>}
                    <div>{m.body}</div>
                    <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" rows={2} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
              <div className="flex gap-2">
                <Select value={msgType} onValueChange={(v: any) => setMsgType(v)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message (client sees)</SelectItem>
                    <SelectItem value="note">Private note</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={send} className="ml-auto"><Send className="h-4 w-4 mr-1" /> Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <Tabs defaultValue="notes">
            <CardHeader>
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="notes"><StickyNote className="h-3 w-3 mr-1" /> Notes</TabsTrigger>
                <TabsTrigger value="review"><Calendar className="h-3 w-3 mr-1" /> Review</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="notes" className="space-y-2 m-0">
                <Select value={noteType} onValueChange={setNoteType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["General", "Suitability", "Risk review", "Complaint", "Action required"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea rows={3} value={noteBody} onChange={(e) => setNoteBody(e.target.value)} placeholder="Note…" />
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={notePrivate} onChange={(e) => setNotePrivate(e.target.checked)} /> Private</label>
                <Button size="sm" onClick={addNote} className="w-full">Add note</Button>
                <div className="space-y-2 pt-2">
                  {clientNotes.map((n) => (
                    <div key={n.id} className="text-xs border rounded p-2">
                      <div className="flex justify-between"><Badge variant="outline">{n.type}</Badge>{n.isPrivate && <Badge variant="secondary">Private</Badge>}</div>
                      <div className="mt-1">{n.body}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="review" className="space-y-2 m-0">
                <Input type="datetime-local" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                <Select value={reviewFormat} onValueChange={setReviewFormat}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["In-person", "Video call", "Phone"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={scheduleReview} className="w-full">Schedule review</Button>
                <div className="space-y-1 pt-2">
                  {clientReviews.map((r) => (
                    <div key={r.id} className="text-xs border rounded p-2">
                      {new Date(r.scheduledAt).toLocaleString("en-GB")} · {r.format}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
