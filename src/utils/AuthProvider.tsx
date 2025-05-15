// src/utils/AuthProvider.tsx
import { createContext, ReactNode, useContext, useState, useEffect } from "react"; // Tambahkan useEffect jika diperlukan untuk sinkronisasi

// UPDATE INTERFACE USER DI SINI
interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user'; // TAMBAHKAN properti 'role'
  // Tambahkan properti lain jika ada dari backend, misal: nama_lengkap, dll.
}

// Tidak ada perubahan pada AuthContextType, karena 'user' akan menggunakan User yang sudah diupdate
type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Cek token saat inisialisasi
    const token = localStorage.getItem("token");
    return !!token;
  });

  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User; // Casting ke User (dengan role)
        // Validasi sederhana apakah parsedUser memiliki properti yang diharapkan (terutama role)
        if (parsedUser && typeof parsedUser.id === 'number' && typeof parsedUser.username === 'string' && parsedUser.role) {
          return parsedUser;
        } else {
          console.warn("User data from localStorage is invalid or missing role. Clearing.");
          localStorage.removeItem("user"); // Hapus data user yang tidak valid
          localStorage.removeItem("token"); // Hapus juga token jika user tidak valid
          return null;
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem("user"); // Hapus data user yang rusak
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });

  // Sinkronisasi isAuthenticated jika user berubah (misalnya karena localStorage dibersihkan di atas)
  useEffect(() => {
    setIsAuthenticated(!!user && !!localStorage.getItem("token"));
  }, [user]);


  const login = (token: string, userData: User) => {
    // Pastikan userData yang diterima dari fungsi login memiliki properti 'role'
    if (!userData.role) {
      console.error("Login attempt with user data missing 'role'. User data:", userData);
      // Anda bisa throw error atau handle sesuai kebutuhan
      // return; // Contoh: jangan lanjutkan login jika role tidak ada
    }
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const getToken = (): string | null => {
    return localStorage.getItem("token");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => { // Pastikan tipe kembaliannya benar
  const context = useContext(AuthContext);
  if (!context) {
    // Pesan error yang lebih konsisten
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};