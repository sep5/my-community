'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CommunityFeed from '@/components/community/CommunityFeed';

function CommunityContent() {
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') ?? 'latest';

  return (
    <MainLayout>
      <div className="section-container py-12 md:py-16">
        <div className="mb-10">
          <p className="text-xs tracking-[0.2em] uppercase text-[#7E6E62] mb-2">Community</p>
          <h1 className="text-editorial text-4xl md:text-5xl font-bold text-[#C41E2A] mb-6">
            갤러리
          </h1>
          <div className="flex gap-2">
            {[
              { label: '최신순', value: 'latest' },
              { label: '인기순', value: 'popular' },
            ].map(({ label, value }) => (
              <a
                key={value}
                href={`?sort=${value}`}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors duration-200 ${
                  sort === value
                    ? 'bg-[#C41E2A] text-white border-[#C41E2A]'
                    : 'border-[#D8D0C8] text-[#7E6E62] hover:border-[#C41E2A] hover:text-[#C41E2A]'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
        <CommunityFeed sort={sort} />
      </div>
    </MainLayout>
  );
}

export default function CommunityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEE8DF]" />}>
      <CommunityContent />
    </Suspense>
  );
}
