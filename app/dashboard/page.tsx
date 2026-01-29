'use client'

import React, { useEffect, useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

// Configuração de Rota para Vercel (Timeout aumentado para 60s)
export const maxDuration = 60;

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            setUserEmail(user.email);
        }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return <Dashboard onLogout={handleLogout} userEmail={userEmail} />;
}