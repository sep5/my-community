import type { Metadata } from 'next';
import MainLayout from '@/components/layout/MainLayout';
import PostEditor from '@/features/post/PostEditor';

export const metadata: Metadata = { title: '새 글 작성' };

export default function CreatePostPage() {
  return (
    <MainLayout>
      <div className="section-container py-12 md:py-16">
        <PostEditor />
      </div>
    </MainLayout>
  );
}
