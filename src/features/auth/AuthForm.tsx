'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/* ─── Schema ─── */
const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
});

const signupSchema = loginSchema.extend({
  nickname: z.string().min(2, '닉네임은 2자 이상이어야 합니다.').max(20, '닉네임은 20자 이하여야 합니다.'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

/**
 * AuthForm 컴포넌트 — 로그인/회원가입 폼
 *
 * Props:
 * @param {'login' | 'signup'} mode - 폼 모드 [Required]
 *
 * Example usage:
 * <AuthForm mode="login" />
 */
export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isSignup = mode === 'signup';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: (isSignup ? zodResolver(signupSchema) : zodResolver(loginSchema)) as any,
  });

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true);
    try {
      if (isSignup) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { nickname: values.nickname } },
        });
        if (signUpError) throw signUpError;

        /* 이메일 인증 자동 처리 (60초 내 가입한 사용자만 적용) */
        if (signUpData.user) {
          await supabase.rpc('confirm_new_signup', { p_user_id: signUpData.user.id });
        }

        /* 가입 직후 자동 로그인 */
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (loginError) {
          toast.success('가입 완료! 이메일 인증 후 로그인해주세요.');
          router.push('/login');
        } else {
          toast.success('가입 완료! 환영합니다.');
          router.push('/');
          router.refresh();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast.success('로그인되었습니다.');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="text-editorial text-2xl font-bold text-[#C41E2A]">
          My Community
        </Link>
        <p className="mt-2 text-sm text-[#7E6E62]">
          {isSignup ? '새 계정을 만들어보세요.' : '다시 만나서 반갑습니다.'}
        </p>
      </div>

      {/* Card */}
      <div className="bg-[#F7F3ED] border border-[#D8D0C8] rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="nickname" className="text-sm text-[#7E6E62]">닉네임</Label>
              <Input
                id="nickname"
                placeholder="홍길동"
                {...register('nickname')}
                className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] focus:ring-[#C41E2A]/20"
                aria-describedby={errors.nickname ? 'nickname-error' : undefined}
              />
              {errors.nickname && (
                <p id="nickname-error" className="text-xs text-red-500">{errors.nickname.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-[#7E6E62]">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              {...register('email')}
              className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] focus:ring-[#C41E2A]/20"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-[#7E6E62]">비밀번호</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="6자 이상"
                {...register('password')}
                className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] focus:ring-[#C41E2A]/20 pr-10"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E6E62] hover:text-[#C41E2A] transition-colors"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm text-[#7E6E62]">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호 재입력"
                {...register('confirmPassword')}
                className="bg-white border-[#D8D0C8] focus:border-[#C41E2A] focus:ring-[#C41E2A]/20"
                aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirm-error" className="text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#C41E2A] text-white text-sm font-medium rounded-full hover:bg-[#9A1020] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 size={15} className="animate-spin" aria-hidden />}
            {isSignup ? '회원가입' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-[#7E6E62] mt-6">
          {isSignup ? (
            <>
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-[#C41E2A] hover:text-[#9A1020] font-medium transition-colors">
                로그인
              </Link>
            </>
          ) : (
            <>
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" className="text-[#C41E2A] hover:text-[#9A1020] font-medium transition-colors">
                회원가입
              </Link>
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}
