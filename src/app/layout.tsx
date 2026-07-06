import type { Metadata } from 'next';
import { Inter, Playfair_Display, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/common/Providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'My Community — 조용한 숲속의 갤러리',
    template: '%s | My Community',
  },
  description: '감성적인 이미지 중심 커뮤니티. 일상의 아름다움을 함께 나눕니다.',
  keywords: ['커뮤니티', '갤러리', '라이프스타일', '자연', '사진'],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    title: 'My Community',
    description: '감성적인 이미지 중심 커뮤니티',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
