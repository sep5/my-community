'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BannerSection() {
  return (
    <section className="section-container py-12 md:py-16">
      <motion.div
        className="rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        style={{ backgroundColor: '#FFF3D4' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {/* Left: Text */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h2
            className="text-editorial text-4xl md:text-5xl font-bold italic leading-tight mb-5"
            style={{ color: '#C82828' }}
          >
            나의 이야기를<br />공유하세요
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-xs" style={{ color: '#5A4A40' }}>
            일상 속 소중한 기록을 함께 나눠보세요 —
            다양한 이야기들이 모여 더 풍부한 커뮤니티가 됩니다.
          </p>
          <div>
            <Link
              href="/post/create"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-full hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#C82828' }}
            >
              글 작성하기
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Right: Decorative visual */}
        <div className="flex items-center justify-center p-8 md:p-12">
          <div className="relative w-full max-w-[220px]">
            {/* Main card */}
            <div
              className="w-full rounded-2xl flex items-center justify-center shadow-md"
              style={{ aspectRatio: '3/4', backgroundColor: '#F5A0B5' }}
            >
              <div className="text-center select-none">
                <div className="text-6xl mb-3">🍀</div>
                <p className="text-xs tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  My Story
                </p>
              </div>
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#C82828' }}
            >
              ✨ 나눔
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
