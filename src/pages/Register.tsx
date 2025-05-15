import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/AxiosInstance"; // Pastikan path ini benar
import toast from 'react-hot-toast'; // Import toast

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
  // Jika backend memerlukan role saat registrasi (biasanya tidak, default 'user')
  // role?: 'user'; // Atau 'admin' jika ada mekanisme khusus
};

const Register = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>();

  const handleRegister = async (data: RegisterInput) => {
    try {
      // Sesuaikan data yang dikirim dengan apa yang diharapkan backend
      // Biasanya 'role' di-set default di backend atau tidak dikirim dari frontend saat registrasi user biasa
      await axios.post("/api/auth/register", { // Sesuaikan endpoint API Anda
        email: data.email,
        username: data.username,
        password: data.password,
        // Jika Anda mengirim role dari frontend, tambahkan:
        // role: data.role || 'user',
      });
      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registrasi gagal. Username atau email mungkin sudah terdaftar.";
      toast.error(errorMessage);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleRegister,
  });

  const inputStyle = "w-full p-3 border rounded-md focus:outline-none focus:ring-2 shadow-sm";
  const errorBorderStyle = "border-red-500 focus:ring-red-500";
  const defaultBorderStyle = "border-gray-300 focus:ring-blue-500";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sisi Kiri - Informasi & Branding */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col justify-center items-center p-8 md:p-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
         <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Selamat Datang!</h1>
         <p className="text-lg md:text-xl text-center mb-8 max-w-md opacity-90">
           Buat akun untuk mengakses Portal Data Mahasiswa. Kelola data diri, lihat informasi akademik, dan banyak lagi.
         </p>
         <Link
            to="/login"
            className="flex items-center bg-white text-blue-700 font-semibold rounded-lg py-3 px-8 hover:bg-blue-50 transition-colors shadow-md"
          >
            <span className="mr-2">Sudah punya akun? Login</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
         </Link>
      </div>

      {/* Sisi Kanan - Form Registrasi */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-white flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">
            Buat Akun Baru
          </h2>

          <form
            className="space-y-5" // Sedikit menambah spasi antar field
            onSubmit={handleSubmit((data) => mutate(data))}
          >
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className={`${inputStyle} ${errors.username ? errorBorderStyle : defaultBorderStyle}`}
                {...register("username", { required: "Username wajib diisi" })}
                placeholder="Contoh: john.doe"
              />
              {errors.username && (
                <p className="text-red-600 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`${inputStyle} ${errors.email ? errorBorderStyle : defaultBorderStyle}`}
                {...register("email", {
                    required: "Email wajib diisi",
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Format email tidak valid"
                    }
                 })}
                 placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={`${inputStyle} ${errors.password ? errorBorderStyle : defaultBorderStyle}`}
                {...register("password", {
                    required: "Password wajib diisi",
                    minLength: { value: 8, message: "Password minimal 8 karakter" } // Ubah jika perlu
                })}
                autoComplete="new-password"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isPending ? "Mendaftar..." : "Daftar Akun"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-semibold hover:underline"
            >
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;