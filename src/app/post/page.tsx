'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import LikeButton from '@/components/community/LikeButton';
import CommentSection from '@/components/community/CommentSection';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types';

function PostDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound404(true); setLoading(false); return; }

    async function load() {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:users(id, nickname, avatar, bio),
          images:post_images(id, image_url, order),
          likes_count:likes(count),
          comments_count:comments(count)
        `)
        .eq('id', id)
        .single();

      if (error || !data) { setNotFound404(true); setLoading(false); return; }

      const count = Array.isArray(data.likes_count) ? data.likes_count[0]?.count ?? 0 : 0;
      setLikesCount(count);
      setPost({
        ...data,
        likes_count: count,
        comments_count: Array.isArray(data.comments_count) ? data.comments_count[0]?.count ?? 0 : 0,
      });

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const { data: like } = await supabase
          .from('likes').select('id').eq('post_id', id).eq('user_id', sessionData.session.user.id).maybeSingle();
        setIsLiked(!!like);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (notFound404) return notFound();

  if (loading) {
    return (
      <MainLayout>
        <div className="section-container py-16 max-w-3xl mx-auto animate-pulse">
          <div className="h-64 bg-[#E4DDD0] rounded-2xl mb-8" />
          <div className="h-10 bg-[#E4DDD0] rounded-full w-3/4 mb-4" />
          <div className="h-4 bg-[#E4DDD0] rounded-full w-1/2" />
        </div>
      </MainLayout>
    );
  }

  if (!post) return null;

  const sortedImages = [...(post.images ?? [])].sort((a, b) => a.order - b.order);
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <MainLayout>
      <article className="section-container py-12 md:py-16 max-w-3xl mx-auto">
        <Link href="/community" className="text-xs text-[#7E6E62] hover:text-[#C41E2A] transition-colors mb-8 inline-block">
          ← 커뮤니티로 돌아가기
        </Link>

        {post.thumbnail && (
          <div className="relative w-full rounded-2xl overflow-hidden mb-10 bg-[#E4DDD0]" style={{ aspectRatio: '16/9' }}>
            <Image src={post.thumbnail} alt={post.title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 800px" />
          </div>
        )}

        <h1 className="text-editorial text-3xl md:text-4xl lg:text-5xl font-bold text-[#C41E2A] leading-tight mb-6">{post.title}</h1>

        <div className="flex items-center gap-3 pb-6 border-b border-[#D8D0C8] mb-8">
          <Avatar className="w-10 h-10 border-2 border-[#D8D0C8]">
            <AvatarImage src={post.author?.avatar ?? ''} alt={post.author?.nickname ?? ''} />
            <AvatarFallback className="bg-[#E4DDD0] text-[#C41E2A] text-sm font-medium">
              {post.author?.nickname?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author?.nickname ?? '익명'}</p>
            <time dateTime={post.created_at} className="text-xs text-[#7E6E62]">{formattedDate}</time>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 leading-relaxed mb-10 whitespace-pre-wrap">{post.content}</div>

        {sortedImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {sortedImages.map((img) => (
              <div key={img.id} className="relative rounded-xl overflow-hidden bg-[#E4DDD0]" style={{ aspectRatio: '4/3' }}>
                <Image src={img.image_url} alt="게시글 이미지" fill className="object-cover" sizes="(max-width: 640px) 100vw, 400px" />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center py-8 border-t border-b border-[#D8D0C8] mb-10">
          <div className="flex flex-col items-center gap-2">
            <LikeButton postId={id} initialCount={likesCount} initialLiked={isLiked} />
            <p className="text-xs text-[#7E6E62]">좋아요를 눌러 응원해주세요</p>
          </div>
        </div>

        <CommentSection postId={id} />
      </article>
    </MainLayout>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEE8DF]" />}>
      <PostDetailContent />
    </Suspense>
  );
}
