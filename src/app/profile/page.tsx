'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProfileView from '@/features/profile/ProfileView';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/login'); return; }

      const { data } = await supabase
        .from('users').select('*').eq('id', sessionData.session.user.id).single();
      setUser(data);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="section-container py-16 animate-pulse">
          <div className="flex gap-6 mb-12 pb-10 border-b border-[#D8D0C8]">
            <div className="w-20 h-20 rounded-full bg-[#E4DDD0]" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-6 bg-[#E4DDD0] rounded-full w-32" />
              <div className="h-4 bg-[#E4DDD0] rounded-full w-48" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="section-container py-12 md:py-16">
        <ProfileView user={user} />
      </div>
    </MainLayout>
  );
}
