'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import MasonryGrid from './MasonryGrid';
import CardGrid from './CardGrid';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types';

async function fetchPosts(sort = 'latest'): Promise<Post[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:users(id, nickname, avatar),
      images:post_images(id, image_url, order),
      likes_count:likes(count),
      comments_count:comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(sort === 'popular' ? 50 : 20);

  if (error) throw error;

  let posts = (data ?? []).map((post) => ({
    ...post,
    likes_count: Array.isArray(post.likes_count) ? post.likes_count[0]?.count ?? 0 : 0,
    comments_count: Array.isArray(post.comments_count) ? post.comments_count[0]?.count ?? 0 : 0,
    is_liked: false,
  }));

  if (sort === 'popular') {
    posts = posts.sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0)).slice(0, 20);
  }

  if (!userId || posts.length === 0) return posts;

  const { data: likedRows } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId)
    .in('post_id', posts.map((p) => p.id));

  const likedSet = new Set((likedRows ?? []).map((r) => r.post_id));
  return posts.map((p) => ({ ...p, is_liked: likedSet.has(p.id) }));
}

/**
 * CommunityFeed 컴포넌트
 * Supabase에서 게시글을 가져와 MasonryGrid로 렌더링
 *
 * Props:
 * @param {string} sort - 정렬 방식 ('latest' | 'popular') [Optional, 기본값: 'latest']
 * @param {string} layout - 레이아웃 방식 ('masonry' | 'card') [Optional, 기본값: 'masonry']
 *
 * Example usage:
 * <CommunityFeed sort="latest" layout="card" />
 */
export default function CommunityFeed({ sort = 'latest', layout = 'masonry' }: { sort?: string; layout?: 'masonry' | 'card' }) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', sort],
    queryFn: () => fetchPosts(sort),
  });

  return (
    <div>
      {/* Write Button */}
      <div className="flex justify-end mb-6">
        <Link
          href="/post/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C41E2A] text-white text-sm font-medium rounded-full hover:bg-[#9A1020] transition-colors duration-200"
        >
          <Plus size={15} aria-hidden />
          글 작성
        </Link>
      </div>
      {layout === 'card' ? (
        <CardGrid posts={posts} isLoading={isLoading} />
      ) : (
        <MasonryGrid posts={posts} isLoading={isLoading} />
      )}
    </div>
  );
}
