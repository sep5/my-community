'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, PenLine } from 'lucide-react';

export default function HomeBanner() {
  return (
    <section className="section-container pt-28 pb-8 md:pt-32 md:pb-10">
      <motion.div
        className="relative rounded-2xl overflow-hidden px-8 py-14 md:px-14 md:py-20"
        style={{ background: 'linear-gradient(135deg, #C82828 0%, #7A1010 100%)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 배경 장식 원 */}
        <div
          className="absolute -top-16 -right-16 w-72 h-72 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
        />
        <div
          className="absolute -bottom-10 right-24 w-44 h-44 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        />

        {/* 콘텐츠 */}
        <div className="relative z-10 max-w-lg">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
            My Community
          </p>
          <h1
            className="text-editorial text-4xl md:text-5xl lg:text-6xl font-bold italic leading-tight mb-4"
            style={{ color: '#FFFFFF' }}
          >
            조용한 숲속의<br />갤러리
          </h1>
          <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
            일상의 아름다운 순간을 담아 나누는 공간.<br />
            자연과 삶을 사랑하는 사람들의 커뮤니티.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FFFFFF', color: '#C82828' }}
            >
              커뮤니티 보기
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/post/create"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-full border transition-colors hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.35)' }}
            >
              <PenLine size={14} />
              글 작성하기
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
