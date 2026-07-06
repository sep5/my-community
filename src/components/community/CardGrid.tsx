'use client';

import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import type { Post } from '@/types';

/**
 * CardGrid 컴포넌트
 * Desktop 3열 / Tablet 2열 / Mobile 1열 균일 그리드 레이아웃
 *
 * Props:
 * @param {Post[]} posts - 게시글 목록 [Required]
 * @param {boolean} isLoading - 로딩 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <CardGrid posts={posts} isLoading={false} />
 */
export default function CardGrid({
  posts,
  isLoading = false,
}: {
  posts: Post[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <span className="text-5xl mb-4">🍀</span>
        <p className="text-[#7E6E62] text-base">아직 게시글이 없습니다.</p>
        <p className="text-[#7E6E62] text-sm mt-1">첫 번째 글을 작성해보세요.</p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-label="게시글 목록"
    >
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
