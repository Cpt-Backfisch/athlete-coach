import { supabase } from './supabase';

// ── Typen ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  user_id: string; // Owner — für Lösch-Berechtigung
  share_token: string;
  author_name: string;
  message: string;
  created_at: string;
}

export interface CommentInput {
  user_id: string; // Owner-ID, damit RLS den Insert erlaubt
  share_token: string;
  author_name: string;
  message: string;
}

// ── Funktionen ─────────────────────────────────────────────────────────────

// Öffentlich lesbar — kein Auth nötig (RLS Share-Policy)
export async function fetchComments(shareToken: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('share_token', shareToken)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Kommentare laden fehlgeschlagen: ${error.message}`);
  return (data ?? []) as Comment[];
}

// Öffentlich schreibbar ohne Login (RLS Share-Policy erlaubt anonyme Inserts)
export async function createComment(input: CommentInput): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: input.user_id,
      share_token: input.share_token,
      author_name: input.author_name.trim(),
      message: input.message.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(`Kommentar erstellen fehlgeschlagen: ${error.message}`);
  return data as Comment;
}

// Nur eingeloggter Owner kann löschen (RLS)
export async function deleteComment(id: string): Promise<void> {
  const { data, error } = await supabase.from('comments').delete().eq('id', id).select();
  if (error) throw new Error(`Kommentar löschen fehlgeschlagen: ${error.message}`);
  if (!data || data.length === 0)
    throw new Error('Kommentar löschen fehlgeschlagen: Keine Berechtigung oder nicht gefunden');
}
