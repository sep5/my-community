'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Post } from '@/types';
import LikeButton from '@/components/community/LikeButton';

/**
 * PostCard 컴포넌트
 *
 * Props:
 * @param {Post} post - 게시글 데이터 [Required]
 * @param {number} index - 애니메이션 딜레이용 인덱스 [Optional, 기본값: 0]
 *
 * Example usage:
 * <PostCard post={post} index={0} />
 */
const CARD_BG_COLORS = ['#C82828', '#F5A0B5', '#88C0D0'];

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const cardBg = CARD_BG_COLORS[index % CARD_BG_COLORS.length];
  const formattedDate = new Date(post.created_at).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      className="group bg-[#F7F3ED] border border-[#D8D0C8] rounded-2xl overflow-hidden card-hover"
    >
      <Link href={`/post?id=${post.id}`} aria-label={`게시글: ${post.title}`}>
        {/* Thumbnail */}
        <div className="relative overflow-hidden bg-[#E4DDD0]" style={{ aspectRatio: '4/3' }}>
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: cardBg }}>
              <span className="text-xs font-medium uppercase select-none" style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>
                gallery image
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#C41E2A]/0 group-hover:bg-[#C41E2A]/5 transition-colors duration-300" />
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-4 md:p-5">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-7 h-7 border border-[#D8D0C8]">
            <AvatarImage src={post.author?.avatar ?? ''} alt={post.author?.nickname ?? '작성자'} />
            <AvatarFallback className="bg-[#E4DDD0] text-[#C41E2A] text-xs">
              {post.author?.nickname?.[0]?.toUpperCase() ?? 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-[#7E6E62] font-medium">
            {post.author?.nickname ?? '익명'}
          </span>
          <span className="text-[#D8D0C8] text-xs">·</span>
          <time dateTime={post.created_at} className="text-xs text-[#7E6E62]">
            {formattedDate}
          </time>
        </div>

        {/* Title */}
        <Link href={`/post?id=${post.id}`}>
          <h2 className="text-editorial text-base md:text-lg font-semibold text-foreground leading-snug hover:text-[#C41E2A] transition-colors line-clamp-2 mb-3">
            {post.title}
          </h2>
        </Link>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <LikeButton
            postId={post.id}
            initialCount={post.likes_count ?? 0}
            initialLiked={post.is_liked ?? false}
          />
          <div className="flex items-center gap-1 text-[#7E6E62] text-xs">
            <MessageCircle size={13} aria-hidden />
            <span>{post.comments_count ?? 0}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
