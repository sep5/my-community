'use client';

import PostCard from './PostCard';
import PostCardSkeleton from './PostCardSkeleton';
import type { Post } from '@/types';

/**
 * MasonryGrid 컴포넌트
 * Desktop 4열 / Tablet 2열 / Mobile 1열 Masonry 레이아웃
 *
 * Props:
 * @param {Post[]} posts - 게시글 목록 [Required]
 * @param {boolean} isLoading - 로딩 여부 [Optional, 기본값: false]
 *
 * Example usage:
 * <MasonryGrid posts={posts} isLoading={false} />
 */
export default function MasonryGrid({
  posts,
  isLoading = false,
}: {
  posts: Post[];
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid mb-4 md:mb-5">
            <PostCardSkeleton />
          </div>
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
      className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-5"
      aria-label="게시글 목록"
    >
      {posts.map((post, index) => (
        <div key={post.id} className="break-inside-avoid mb-4 md:mb-5">
          <PostCard post={post} index={index} />
        </div>
      ))}
    </div>
  );
}
