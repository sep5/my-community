'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Camera, Pencil, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MasonryGrid from '@/components/community/MasonryGrid';
import { supabase } from '@/lib/supabase';
import type { User, Post } from '@/types';

async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data } = await supabase
    .from('posts')
    .select('*, author:users(id, nickname, avatar), likes_count:likes(count), comments_count:comments(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data ?? []).map((p) => ({
    ...p,
    likes_count: Array.isArray(p.likes_count) ? p.likes_count[0]?.count ?? 0 : 0,
    comments_count: Array.isArray(p.comments_count) ? p.comments_count[0]?.count ?? 0 : 0,
  }));
}

async function fetchLikedPosts(userId: string): Promise<Post[]> {
  const { data } = await supabase
    .from('likes')
    .select('post:posts(*, author:users(id, nickname, avatar), likes_count:likes(count), comments_count:comments(count))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).flatMap((item: any) => {
    const p = item.post;
    if (!p) return [];
    return [{
      ...p,
      likes_count: Array.isArray(p.likes_count) ? p.likes_count[0]?.count ?? 0 : 0,
      comments_count: Array.isArray(p.comments_count) ? p.comments_count[0]?.count ?? 0 : 0,
    }] as Post[];
  });
}

/**
 * ProfileView 컴포넌트 — 마이페이지 전체 뷰
 *
 * Props:
 * @param {User | null} user - 사용자 정보 [Required]
 *
 * Example usage:
 * <ProfileView user={user} />
 */
export default function ProfileView({ user }: { user: User | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const userId = user?.id ?? '';

  const { data: myPosts = [], isLoading: loadingMyPosts } = useQuery({
    queryKey: ['myPosts', userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!userId,
  });

  const { data: likedPosts = [], isLoading: loadingLiked } = useQuery({
    queryKey: ['likedPosts', userId],
    queryFn: () => fetchLikedPosts(userId),
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      let avatarUrl = user?.avatar ?? null;

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${userId}/avatar.${ext}`;
        await supabase.storage.from('community-images').upload(path, avatarFile, { upsert: true });
        const { data } = supabase.storage.from('community-images').getPublicUrl(path);
        avatarUrl = `${data.publicUrl}?t=${Date.now()}`;
      }

      const { error } = await supabase
        .from('users')
        .update({ nickname, bio, avatar: avatarUrl })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('프로필이 저장되었습니다.');
      setIsEditing(false);
      setAvatarFile(null);
      queryClient.invalidateQueries({ queryKey: ['myPosts', userId] });
    },
    onError: () => toast.error('저장에 실패했습니다.'),
  });

  const displayAvatar = avatarPreview ?? user?.avatar ?? '';

  return (
    <div>
      {/* Profile Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12 pb-10 border-b border-[#D8D0C8]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Avatar */}
        <div className="relative group">
          <Avatar className="w-20 h-20 border-2 border-[#D8D0C8]">
            <AvatarImage src={displayAvatar} alt={user?.nickname ?? '프로필'} />
            <AvatarFallback className="bg-[#E4DDD0] text-[#C41E2A] text-2xl font-medium">
              {user?.nickname?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="프로필 이미지 변경"
            >
              <Camera size={18} className="text-white" />
            </button>
          )}
          <input
            ref={avatarRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임"
                className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] max-w-xs"
              />
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="자기소개를 입력해주세요"
                rows={2}
                className="resize-none bg-white border-[#D8D0C8] focus:border-[#C41E2A] text-sm max-w-xs"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-editorial text-2xl font-bold text-[#C41E2A] mb-1">
                {user?.nickname ?? '닉네임 없음'}
              </h1>
              <p className="text-sm text-[#7E6E62] leading-relaxed">
                {user?.bio ?? '소개글이 없습니다.'}
              </p>
            </div>
          )}
        </div>

        {/* Edit Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#C41E2A] text-white text-sm rounded-full hover:bg-[#9A1020] disabled:opacity-60 transition-colors"
              >
                {updateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                저장
              </button>
              <button
                onClick={() => { setIsEditing(false); setNickname(user?.nickname ?? ''); setBio(user?.bio ?? ''); setAvatarPreview(null); }}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#D8D0C8] text-[#7E6E62] text-sm rounded-full hover:border-[#C41E2A] transition-colors"
              >
                <X size={13} />
                취소
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-[#D8D0C8] text-[#7E6E62] text-sm rounded-full hover:border-[#C41E2A] hover:text-[#C41E2A] transition-colors"
            >
              <Pencil size={13} />
              수정
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="my-posts">
        <TabsList className="bg-[#E4DDD0] mb-8">
          <TabsTrigger value="my-posts" className="data-[state=active]:bg-[#C41E2A] data-[state=active]:text-white text-sm">
            작성한 글 ({myPosts.length})
          </TabsTrigger>
          <TabsTrigger value="liked-posts" className="data-[state=active]:bg-[#C41E2A] data-[state=active]:text-white text-sm">
            좋아요한 글 ({likedPosts.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-posts">
          <MasonryGrid posts={myPosts} isLoading={loadingMyPosts} />
        </TabsContent>
        <TabsContent value="liked-posts">
          <MasonryGrid posts={likedPosts} isLoading={loadingLiked} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
