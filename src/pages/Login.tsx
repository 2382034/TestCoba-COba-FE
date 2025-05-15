import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider"; // Pastikan path ini benar
import axios from "../utils/AxiosInstance"; // Pastikan path ini benar
import { useMutation } from "@tanstack/react-query";
import toast from 'react-hot-toast'; // Import toast untuk notifikasi

export type LoginInput = {
  email: string; // Atau username, sesuaikan dengan backend Anda
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Fungsi login dari AuthProvider
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>();

  // Tipe User dari backend Anda (pastikan ini konsisten dengan AuthProvider)
  interface UserFromBackend {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'user'; // Penting untuk memiliki role
    // tambahkan properti lain jika ada
  }

  const handleLogin = async (data: LoginInput) => {
    try {
      const res = await axios.post<{ access_token: string; user: UserFromBackend }>(
        "/api/auth/login", // Sesuaikan endpoint API Anda
        {
          email: data.email, // atau username jika backend menggunakan username
          password: data.password
        }
      );

      if (res.data && res.data.access_token && res.data.user && res.data.user.role) {
        // Panggil fungsi login dari AuthContext
        login(res.data.access_token, res.data.user);
        toast.success("Login berhasil!");
        navigate("/"); // Arahkan ke Home atau dashboard setelah login
      } else {
        console.error("Login response missing data or role:", res);
        toast.error("Data login tidak lengkap dari server.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || "Email atau password salah.";
      toast.error(errorMessage);
    }
  };

  const { mutate, isPending } = useMutation({ // isPending untuk status loading
    mutationFn: handleLogin,
    // onError sudah ditangani di dalam handleLogin, tapi bisa juga di sini
  });

  const inputStyle = "w-full p-3 border rounded-md focus:outline-none focus:ring-2 shadow-sm";
  const errorBorderStyle = "border-red-500 focus:ring-red-500";
  const defaultBorderStyle = "border-gray-300 focus:ring-blue-500";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sisi Kiri - Informasi & Branding */}
      <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col justify-center items-center p-8 md:p-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        {/* Ganti dengan logo atau ikon yang relevan */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m0 0a8.485 8.485 0 0011.921 0M12 17.747a8.485 8.485 0 01-11.921 0M12 6.253a8.485 8.485 0 0111.921 0M12 6.253L5.039 9.06M12 6.253L18.961 9.06M12 17.747L5.039 14.94M12 17.747L18.961 14.94M9 12a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
         <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Portal Data Mahasiswa</h1>
         <p className="text-lg md:text-xl text-center mb-8 max-w-md opacity-90">
            Akses informasi akademik, kelola data, dan hubungkan diri dengan komunitas kampus.
         </p>
         <Link
           to="/register"
           className="flex items-center bg-white text-blue-700 font-semibold rounded-lg py-3 px-8 hover:bg-blue-50 transition-colors shadow-md"
         >
           <span className="mr-2">Belum punya akun? Daftar</span>
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M5 12h14M12 5l7 7-7 7"/>
           </svg>
         </Link>
      </div>

      {/* Sisi Kanan - Form Login */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-white flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-sm"> {/* Max-width diperkecil agar form lebih fokus */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Masuk Akun</h2>

          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className={`${inputStyle} ${errors.email ? errorBorderStyle : defaultBorderStyle}`}
                {...register("email", { required: "Email wajib diisi" })}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className={`${inputStyle} ${errors.password ? errorBorderStyle : defaultBorderStyle}`}
                {...register("password", { required: "Password wajib diisi" })}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-semibold hover:underline"
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;