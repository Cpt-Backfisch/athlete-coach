import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/EmptyState';
import { fetchComments, createComment, deleteComment } from '@/lib/comments';
import type { Comment } from '@/lib/comments';

interface CommentSectionProps {
  shareToken: string;
  ownerUserId: string;
  isOwner: boolean;
  onCountChange?: (count: number) => void;
}

function formatDatum(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function CommentSection({
  shareToken,
  ownerUserId,
  isOwner,
  onCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  async function laden() {
    try {
      const data = await fetchComments(shareToken);
      setComments(data);
      onCountChange?.(data.length);
    } catch {
      // Fehler still ignorieren — Kommentare sind optional
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    laden();
    // laden ist stabil (kein useCallback nötig da shareToken sich nicht ändert)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim() || content.trim().length < 3) return;
    setIsSubmitting(true);
    try {
      await createComment({
        user_id: ownerUserId,
        share_token: shareToken,
        author_name: authorName,
        message: content,
      });
      setContent('');
      toast.success('Kommentar gesendet');
      await laden();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComment(id);
      toast.success('Kommentar gelöscht');
      await laden();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <section className="space-y-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        Kommentare{comments.length > 0 ? ` (${comments.length})` : ''}
      </h2>

      {/* Kommentar-Formular */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="cs-name">Dein Name</Label>
          <Input
            id="cs-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Dein Name"
            required
            className="max-w-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cs-content">Deine Nachricht</Label>
          <Textarea
            id="cs-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was denkst du?"
            required
            rows={3}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !authorName.trim() || content.trim().length < 3}
        >
          {isSubmitting ? 'Senden…' : 'Kommentar senden'}
        </Button>
      </form>

      {/* Kommentarliste */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Kommentare laden…</p>
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Noch keine Kommentare"
          description="Sei der Erste und hinterlasse eine Nachricht."
          cta={{
            label: 'Ersten Kommentar schreiben',
            onClick: () => formRef.current?.querySelector('input')?.focus(),
          }}
        />
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div
              key={c.id}
              className="rounded-[10px] bg-card border border-border px-4 py-3 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{c.author_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDatum(c.created_at)}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    aria-label="Kommentar löschen"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
