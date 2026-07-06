'use client';

import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  title: z.string().min(2, '제목은 2자 이상이어야 합니다.').max(100, '제목은 100자 이하여야 합니다.'),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다.'),
});

type FormValues = z.infer<typeof schema>;

async function uploadImage(file: File, userId: string, path: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const filePath = `${userId}/${path}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('community-images')
    .upload(filePath, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from('community-images').getPublicUrl(filePath);
  return data.publicUrl;
}

export default function PostEditor() {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const thumbnailRef = useRef<HTMLInputElement>(null);
  const additionalRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleThumbnailFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleAdditionalFiles = (files: File[]) => {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    setAdditionalImages((prev) => [...prev, ...validFiles]);
    setAdditionalPreviews((prev) => [
      ...prev,
      ...validFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeAdditional = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((e: React.DragEvent, target: 'thumbnail' | 'additional') => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (target === 'thumbnail' && files[0]) handleThumbnailFile(files[0]);
    if (target === 'additional') handleAdditionalFiles(files);
  }, []);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      const userId = sessionData.session.user.id;

      let thumbnailUrl: string | null = null;
      if (thumbnail) {
        thumbnailUrl = await uploadImage(thumbnail, userId, 'thumbnail');
      }

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          title: values.title,
          content: values.content,
          thumbnail: thumbnailUrl,
        })
        .select('id')
        .single();

      if (postError || !post) throw postError ?? new Error('게시글 저장 실패');

      if (additionalImages.length > 0) {
        const imageUrls = await Promise.all(
          additionalImages.map((file, i) => uploadImage(file, userId, `image-${i}`))
        );
        await supabase.from('post_images').insert(
          imageUrls.map((url, i) => ({ post_id: post.id, image_url: url, order: i }))
        );
      }

      toast.success('게시글이 등록되었습니다!');
      router.push(`/post?id=${post.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] uppercase text-[#7E6E62] mb-2">Write</p>
        <h1 className="text-editorial text-3xl md:text-4xl font-bold text-[#C41E2A]">새 글 작성</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm text-[#7E6E62]">제목</Label>
          <Input
            id="title"
            placeholder="제목을 입력해주세요"
            {...register('title')}
            className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] text-base"
          />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>

        {/* Thumbnail */}
        <div className="space-y-1.5">
          <Label className="text-sm text-[#7E6E62]">대표 이미지</Label>
          {thumbnailPreview ? (
            <div className="relative rounded-xl overflow-hidden bg-[#E4DDD0]" style={{ aspectRatio: '16/9' }}>
              <Image src={thumbnailPreview} alt="대표 이미지 미리보기" fill className="object-cover" />
              <button
                type="button"
                onClick={() => { setThumbnail(null); setThumbnailPreview(null); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="대표 이미지 제거"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-[#C41E2A] bg-[#C41E2A]/5' : 'border-[#D8D0C8] hover:border-[#C41E2A] bg-white'
              }`}
              onClick={() => thumbnailRef.current?.click()}
              onDrop={(e) => onDrop(e, 'thumbnail')}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              role="button"
              aria-label="대표 이미지 업로드"
            >
              <Upload size={24} className="mx-auto mb-2 text-[#7E6E62]" />
              <p className="text-sm text-[#7E6E62]">드래그하거나 클릭하여 이미지를 업로드하세요</p>
              <p className="text-xs text-[#7E6E62]/60 mt-1">JPG, PNG, WebP (최대 10MB)</p>
            </div>
          )}
          <input
            ref={thumbnailRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleThumbnailFile(e.target.files[0])}
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-sm text-[#7E6E62]">내용</Label>
          <Textarea
            id="content"
            placeholder="내용을 입력해주세요..."
            rows={10}
            {...register('content')}
            className="resize-none bg-white border-[#D8D0C8] focus:border-[#C41E2A] text-sm leading-relaxed"
          />
          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
        </div>

        {/* Additional Images */}
        <div className="space-y-3">
          <Label className="text-sm text-[#7E6E62]">추가 이미지</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {additionalPreviews.map((src, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden bg-[#E4DDD0]" style={{ aspectRatio: '4/3' }}>
                <Image src={src} alt={`추가 이미지 ${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeAdditional(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label={`이미지 ${i + 1} 제거`}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => additionalRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[#D8D0C8] text-[#7E6E62] hover:border-[#C41E2A] hover:text-[#C41E2A] transition-colors bg-white"
              style={{ aspectRatio: '4/3' }}
              aria-label="추가 이미지 업로드"
            >
              <ImagePlus size={20} />
              <span className="text-xs">추가</span>
            </button>
          </div>
          <input
            ref={additionalRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleAdditionalFiles(Array.from(e.target.files))}
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#C41E2A] text-white text-sm font-medium rounded-full hover:bg-[#9A1020] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            등록하기
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-[#D8D0C8] text-[#7E6E62] text-sm rounded-full hover:border-[#C41E2A] hover:text-[#C41E2A] transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </motion.div>
  );
}
