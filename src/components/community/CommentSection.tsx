'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import type { Comment } from '@/types';

async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*, author:users(id, nickname, avatar)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/**
 * CommentSection 컴포넌트
 *
 * Props:
 * @param {string} postId - 게시글 ID [Required]
 *
 * Example usage:
 * <CommentSection postId="abc123" />
 */
export default function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => fetchComments(postId),
  });

  const addMutation = useMutation({
    mutationFn: async (comment: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('로그인이 필요합니다.');
      const { error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: sessionData.session.user.id, comment });
      if (error) throw error;
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : '오류가 발생했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment: string }) => {
      const { error } = await supabase.from('comments').update({ comment }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
    onError: () => toast.error('수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
    onError: () => toast.error('삭제에 실패했습니다.'),
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  return (
    <section aria-label="댓글">
      <h2 className="text-editorial text-xl font-semibold text-[#C41E2A] mb-6">
        댓글 {comments.length > 0 && <span className="text-base text-[#7E6E62]">({comments.length})</span>}
      </h2>

      {/* Comment Input */}
      <div className="flex gap-3 mb-8">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="댓글을 입력해주세요..."
          rows={2}
          className="resize-none bg-white border-[#D8D0C8] focus:border-[#C41E2A] text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
              e.preventDefault();
              addMutation.mutate(text.trim());
            }
          }}
        />
        <button
          onClick={() => text.trim() && addMutation.mutate(text.trim())}
          disabled={!text.trim() || addMutation.isPending}
          className="px-4 py-2 bg-[#C41E2A] text-white rounded-xl disabled:opacity-50 hover:bg-[#9A1020] transition-colors self-end"
          aria-label="댓글 등록"
        >
          {addMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>

      {/* Comment List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={20} className="animate-spin text-[#7E6E62]" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-[#7E6E62] text-sm">
          첫 번째 댓글을 남겨보세요.
        </div>
      ) : (
        <AnimatePresence initial={false}>
          <div className="space-y-5">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex gap-3"
              >
                <Avatar className="w-8 h-8 border border-[#D8D0C8] flex-shrink-0">
                  <AvatarImage src={comment.author?.avatar ?? ''} alt={comment.author?.nickname ?? ''} />
                  <AvatarFallback className="bg-[#E4DDD0] text-[#C41E2A] text-xs">
                    {comment.author?.nickname?.[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{comment.author?.nickname ?? '익명'}</span>
                    <time dateTime={comment.created_at} className="text-xs text-[#7E6E62]">
                      {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                    </time>
                    {currentUserId === comment.user_id && (
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => { setEditingId(comment.id); setEditText(comment.comment); }}
                          className="p-1 text-[#7E6E62] hover:text-[#C41E2A] transition-colors"
                          aria-label="댓글 수정"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(comment.id)}
                          className="p-1 text-[#7E6E62] hover:text-red-500 transition-colors"
                          aria-label="댓글 삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingId === comment.id ? (
                    <div className="flex gap-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="resize-none text-sm bg-white border-[#D8D0C8] focus:border-[#C41E2A]"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => updateMutation.mutate({ id: comment.id, comment: editText })}
                          className="px-3 py-1 text-xs bg-[#C41E2A] text-white rounded-lg hover:bg-[#9A1020] transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs border border-[#D8D0C8] text-[#7E6E62] rounded-lg hover:border-[#C41E2A] transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </section>
  );
}
