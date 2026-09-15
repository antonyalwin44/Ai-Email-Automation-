'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    const savedAdmin = Cookies.get('admin');

    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        logout();
      }
    } else if (!token) {
      router.push('/login');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, admin: adminData } = response.data;
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('admin', JSON.stringify(adminData), { expires: 1 });
    setAdmin(adminData);
    return response.data;
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('admin');
    setAdmin(null);
    router.push('/login');
  };

  return { admin, isLoading, login, logout };
}
