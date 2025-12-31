'use client';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminLogin } from '@/components/AdminLogin';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export function AdminProtected({ children }: AdminProtectedProps) {
  const { isAuthenticated } = useAdminAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}