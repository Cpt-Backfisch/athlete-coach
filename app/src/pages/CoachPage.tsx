import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sendChatMessage } from '@/lib/coach';
import { sendTelegramTest, checkTelegramStatus } from '@/lib/telegram';
import { useCoachSettings } from '@/hooks/useCoachSettings';
import type { ChatMessage } from '@/lib/coach';

// ── Schnellfragen ─────────────────────────────────────────────────────────

const SCHNELLFRAGEN = [
  'Wie sieht mein Training aus?',
  'Bin ich auf Kurs für meinen nächsten Wettkampf?',
  'Was sollte ich diese Woche trainieren?',
];

// ── CoachPage ─────────────────────────────────────────────────────────────

export function CoachPage() {
  const {
    contextWeeks,
    systemPrompt,
    athleteName,
    updateContextWeeks,
    updateSystemPrompt,
    updateAthleteName,
    isLoading,
  } = useCoachSettings();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [settingsOffen, setSettingsOffen] = useState(false);

  // Einstellungsfelder (lokal bis zum Speichern-Button)
  const [promptEntwurf, setPromptEntwurf] = useState('');
  const [nameEntwurf, setNameEntwurf] = useState('');

  // Telegram-Status
  const [telegramKonfiguriert, setTelegramKonfiguriert] = useState<boolean | null>(null);

  // Scroll ans Ende nach neuer Nachricht
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Entwürfe mit geladenen Werten befüllen
  useEffect(() => {
    if (!isLoading) {
      setPromptEntwurf(systemPrompt);
      setNameEntwurf(athleteName);
    }
  }, [isLoading, systemPrompt, athleteName]);

  // Telegram-Status beim Öffnen der Einstellungen laden
  useEffect(() => {
    if (settingsOffen && telegramKonfiguriert === null) {
      checkTelegramStatus().then(setTelegramKonfiguriert);
    }
  }, [settingsOffen, telegramKonfiguriert]);

  async function senden(text: string) {
    const nachricht = text.trim();
    if (!nachricht || isThinking) return;

    const neueNachricht: ChatMessage = { role: 'user', content: nachricht };
    const aktualisiert = [...messages, neueNachricht];
    setMessages(aktualisiert);
    setInput('');
    setIsThinking(true);

    try {
      const antwort = await sendChatMessage(aktualisiert, systemPrompt, contextWeeks);
      setMessages([...aktualisiert, { role: 'assistant', content: antwort }]);
    } catch {
      toast.error('Coach nicht erreichbar');
    } finally {
      setIsThinking(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      senden(input);
    }
  }

  async function handleTelegramTest() {
    try {
      await sendTelegramTest();
      toast.success('Test-Nachricht gesendet ✓');
    } catch (e) {
      toast.error(`Fehler: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-3xl h-[calc(100vh-8rem)]">
      {/* ── Chat-Bereich ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Nachrichtenliste */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <p className="text-muted-foreground text-sm">Stell deinem Coach eine Frage.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SCHNELLFRAGEN.map((frage) => (
                  <button
                    key={frage}
                    onClick={() => senden(frage)}
                    className="text-sm px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {frage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-[12px] px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-[#8E6FE0] text-white'
                    : 'bg-card border border-border text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing-Indicator */}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-[12px] px-4 py-3 text-sm text-muted-foreground flex items-center gap-1">
                Coach denkt nach
                <span className="inline-flex gap-0.5 ml-1">
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Eingabezeile */}
        <div className="flex gap-2 pt-3 border-t border-border mt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht an deinen Coach…"
            disabled={isThinking}
            className="flex-1"
          />
          <Button
            onClick={() => senden(input)}
            disabled={isThinking || !input.trim()}
            size="icon"
            aria-label="Senden"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>

      {/* ── Einstellungen (einklappbar) ───────────────────────────────── */}
      <div className="rounded-[12px] border border-border bg-card">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium"
          onClick={() => setSettingsOffen((v) => !v)}
        >
          Einstellungen
          {settingsOffen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {settingsOffen && (
          <div className="px-4 pb-5 space-y-5 border-t border-border pt-4">
            {/* Kontext-Wochen */}
            <div className="space-y-1.5">
              <Label>Coach sieht die letzten {contextWeeks} Wochen</Label>
              <Select
                value={String(contextWeeks)}
                onValueChange={async (v) => {
                  if (!v) return;
                  await updateContextWeeks(Number(v));
                  toast.success('Gespeichert');
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 Wochen</SelectItem>
                  <SelectItem value="8">8 Wochen</SelectItem>
                  <SelectItem value="12">12 Wochen</SelectItem>
                  <SelectItem value="16">16 Wochen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Athletenname */}
            <div className="space-y-1.5">
              <Label htmlFor="coach-name">Dein Name (für den Coach)</Label>
              <div className="flex gap-2">
                <Input
                  id="coach-name"
                  value={nameEntwurf}
                  onChange={(e) => setNameEntwurf(e.target.value)}
                  placeholder="z.B. Sebastian"
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await updateAthleteName(nameEntwurf);
                    toast.success('Gespeichert');
                  }}
                >
                  Speichern
                </Button>
              </div>
            </div>

            {/* System-Prompt */}
            <div className="space-y-1.5">
              <Label htmlFor="coach-prompt">Coach-Persönlichkeit</Label>
              <Textarea
                id="coach-prompt"
                value={promptEntwurf}
                onChange={(e) => setPromptEntwurf(e.target.value)}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Dieser Prompt wird an Claude gesendet und bestimmt den Stil des Coaches.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await updateSystemPrompt(promptEntwurf);
                  toast.success('Gespeichert');
                }}
              >
                Speichern
              </Button>
            </div>

            {/* Telegram */}
            <div className="space-y-2">
              <Label>Telegram</Label>
              <div className="flex items-center gap-3">
                {telegramKonfiguriert === null ? (
                  <span className="text-xs text-muted-foreground">Prüfe Status…</span>
                ) : telegramKonfiguriert ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    Telegram konfiguriert
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    Nicht konfiguriert
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={handleTelegramTest}>
                  Test-Nachricht senden
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
