// src/utils/PrivateRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // Pastikan path ini benar
import toast from 'react-hot-toast'; // Untuk notifikasi jika akses ditolak

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user'; // Tambahkan prop 'requiredRole' sebagai opsional
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth(); // Ambil isAuthenticated juga untuk cek login
  const location = useLocation();

  // 1. Cek apakah user sudah terautentikasi
  if (!isAuthenticated || !user) {
    // User tidak login, redirect ke halaman login
    // Simpan lokasi saat ini agar bisa redirect kembali setelah login
    toast.error("Anda harus login untuk mengakses halaman ini.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Cek apakah ada peran yang dibutuhkan dan apakah peran user sesuai
  if (requiredRole && user.role !== requiredRole) {
    // User login tetapi tidak memiliki peran yang dibutuhkan
    // Redirect ke halaman utama atau halaman "tidak diizinkan"
    toast.error("Anda tidak memiliki izin untuk mengakses halaman ini.");
    return <Navigate to="/" replace />; // Redirect ke halaman utama (atau halaman 403 jika ada)
  }

  // Jika semua pengecekan lolos, render children (halaman yang diproteksi)
  return <>{children}</>;
};

export default PrivateRoute;