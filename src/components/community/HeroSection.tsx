'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/types';

const CARD_COLORS = ['#C82828', '#F5A0B5', '#88C0D0'];

const FEATURES = [
  '무제한 글 작성 및 갤러리 공유',
  '댓글, 좋아요로 소통하기',
  '프로필 커스텀 및 마이페이지',
  '실시간 인기글 확인',
];

/** 미니 게시글 행 */
function PostRow({ post, index }: { post: Post; index: number }) {
  return (
    <Link
      href={`/post?id=${post.id}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 rounded-lg transition-colors"
    >
      <div
        className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative"
        style={{ backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }}
      >
        {post.thumbnail && (
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" sizes="36px" />
        )}
      </div>
      <span className="text-sm font-medium truncate" style={{ color: 'inherit' }}>
        {post.title}
      </span>
    </Link>
  );
}

export default function HeroSection() {
  const [featuredPost, setFeaturedPost] = useState<Post | null>(null);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);

  useEffect(() => {
    /* 대표 이미지 — 가장 최신 글 1개 */
    supabase
      .from('posts')
      .select('id, title, thumbnail')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setFeaturedPost(data[0] as Post); });

    /* 인기글 — likes 수 기준 상위 3개 (클라이언트 정렬) */
    supabase
      .from('posts')
      .select('id, title, thumbnail, likes:likes(count)')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          const sorted = (data as unknown as Array<{ id: string; title: string; thumbnail: string | null; likes: Array<{ count: number }> }>)
            .map((p) => ({
              id: p.id,
              title: p.title,
              thumbnail: p.thumbnail,
              likes_count: Array.isArray(p.likes) ? p.likes[0]?.count ?? 0 : 0,
            } as Post))
            .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
            .slice(0, 3);
          setPopularPosts(sorted);
        }
      });

    /* 새로운 이야기 — 최신순 3개 */
    supabase
      .from('posts')
      .select('id, title, thumbnail')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setLatestPosts(data as Post[]); });
  }, []);

  return (
    <section className="bg-[#FFF8F2] pt-24" aria-label="히어로 섹션">
      <div className="section-container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-start">

          {/* ── LEFT COLUMN ── */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* 대표 이미지 1개 */}
            <Link href={featuredPost ? `/post?id=${featuredPost.id}` : '/community'}>
              <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '4/5' }}>
                {featuredPost?.thumbnail ? (
                  <Image
                    src={featuredPost.thumbnail}
                    alt={featuredPost.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: CARD_COLORS[0] }}>
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      gallery image
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full text-white" style={{ backgroundColor: '#C82828' }}>
                    New
                  </span>
                </div>
              </div>
            </Link>

            {/* 오늘의 인기글 패널 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#F5A0B5' }}>
              <Link
                href="/community?sort=popular"
                className="flex items-center justify-between px-5 py-3.5 hover:opacity-90 transition-opacity"
              >
                <span className="text-sm font-semibold" style={{ color: '#8C2018' }}>오늘의 인기글</span>
                <ArrowRight size={15} style={{ color: '#8C2018' }} />
              </Link>
              {popularPosts.length > 0 && (
                <div className="px-1 pb-2" style={{ color: '#8C2018' }}>
                  {popularPosts.map((post, i) => (
                    <PostRow key={post.id} post={post} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* 새로운 이야기 패널 */}
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#88C0D0' }}>
              <Link
                href="/community"
                className="flex items-center justify-between px-5 py-3.5 hover:opacity-90 transition-opacity"
              >
                <span className="text-sm font-semibold" style={{ color: '#1A4A5A' }}>새로운 이야기</span>
                <ArrowRight size={15} style={{ color: '#1A4A5A' }} />
              </Link>
              {latestPosts.length > 0 && (
                <div className="px-1 pb-2" style={{ color: '#1A4A5A' }}>
                  {latestPosts.map((post, i) => (
                    <PostRow key={post.id} post={post} index={i} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN ── */}
          <div className="flex flex-col justify-start pt-2">
            {/* Rating row */}
            <motion.div
              className="flex items-center gap-2 mb-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#C82828" style={{ color: '#C82828' }} />
                ))}
              </div>
              <span className="text-sm" style={{ color: '#7E6E62' }}>1,200+ 멤버</span>
            </motion.div>

            {/* Title + tagline */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1
                className="text-editorial text-5xl md:text-6xl lg:text-7xl font-bold italic leading-[1.05] mb-2"
                style={{ color: '#C82828' }}
              >
                My Community
              </h1>
              <p className="text-base" style={{ color: '#7E6E62' }}>조용한 숲속의 갤러리</p>
            </motion.div>

            {/* Description */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold tracking-wide mb-2" style={{ color: '#C82828' }}>소개</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5A4A40' }}>
                일상의 아름다운 순간을 담아 나누는 공간.<br />
                자연과 삶을 사랑하는 사람들의 조용한 커뮤니티.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold tracking-wide mb-3" style={{ color: '#C82828' }}>멤버십 혜택</h3>
              <ul className="space-y-2">
                {FEATURES.map((f) => (
                  <li key={f} className="text-sm flex items-start gap-2" style={{ color: '#5A4A40' }}>
                    <span style={{ color: '#C82828' }} className="mt-0.5 flex-shrink-0">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#C82828' }}
              >
                커뮤니티 보기
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/post/create"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full border hover:bg-[#C82828] hover:text-white transition-all duration-200"
                style={{ color: '#C82828', borderColor: '#C82828' }}
              >
                글 작성하기
              </Link>
              <button
                className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-[#C82828] hover:border-[#C82828] group transition-all duration-200"
                style={{ borderColor: '#EAD8CC', color: '#C82828' }}
                aria-label="저장"
              >
                <Heart size={16} className="group-hover:text-white transition-colors" />
              </button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
