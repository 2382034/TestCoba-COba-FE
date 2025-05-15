// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast'; // Jangan lupa import Toaster jika belum
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from "react-router-dom";

// Layouts
import BaseLayout from "./layouts/BaseLayout";
import RootLayout from "./layouts/RootLayout";

// Core & Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// --- Import Recipes Pages ---
import Recipes from "./pages/Recipes";
import AddRecipes from "./pages/AddRecipes";
import RecipesDetail from "./pages/RecipesDetail";
import EditRecipes from "./pages/EditRecipes";
// --- End Import Recipes Pages ---

// --- Import Posting Pages ---
import Postings from "./pages/Postings";
import AddPosting from "./pages/AddPosting";
import PostingDetail from "./pages/PostingDetail";
import EditPosting from "./pages/EditPosting";
// --- End Import Posting Pages ---

// --- Import Note Pages ---
import Note from "./pages/Note";
import AddNote from "./pages/AddNote";
import NoteDetail from "./pages/NoteDetail";
import EditNote from "./pages/EditNote";
// --- End Import Note Pages ---

// --- Import Data Mahasiswa Pages ---
// Sesuaikan path impor ini jika file Anda ada di subfolder (misal: ./pages/mahasiswa/Data)
import DataMahasiswaPage from "./pages/Data"; // Nama komponen dari Data.tsx
import AddDataMahasiswaPage from "./pages/AddData"; // Nama komponen dari AddData.tsx
import EditDataMahasiswaPage from "./pages/EditData"; // Nama komponen dari EditData.tsx
import DataDetailMahasiswaPage from "./pages/DataDetail"; // Nama komponen dari DataDetail.tsx
// --- End Import Data Mahasiswa Pages ---

// Utils & Providers
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import { AuthProvider } from "./utils/AuthProvider";

const queryClient = new QueryClient();

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        {/* Public Layout */}
        <Route path="/" element={<BaseLayout />}>
          <Route
            path="login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* Private Layout */}
        <Route path="/" element={<RootLayout />}>
          {/* Home */}
          <Route
            index // Default route for '/' under RootLayout
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

          {/* --- Postings Routes (Example) --- */}
          <Route path="postings" element={<PrivateRoute><Postings /></PrivateRoute>} />
          <Route path="add-posting" element={<PrivateRoute><AddPosting /></PrivateRoute>} />
          <Route path="postings/:id" element={<PrivateRoute><PostingDetail /></PrivateRoute>} />
          <Route path="postings/edit/:id" element={<PrivateRoute><EditPosting /></PrivateRoute>} />
          {/* --- End Postings Routes --- */}

          {/* --- Recipes Routes (Example) --- */}
          <Route path="recipes" element={<PrivateRoute><Recipes /></PrivateRoute>} />
          <Route path="add-recipe" element={<PrivateRoute><AddRecipes /></PrivateRoute>} />
          <Route path="recipes/:id" element={<PrivateRoute><RecipesDetail /></PrivateRoute>} />
          <Route path="recipes/edit/:id" element={<PrivateRoute><EditRecipes /></PrivateRoute>} />
          {/* --- End Recipes Routes --- */}

          {/* --- Notes Routes (Example) --- */}
          <Route path="note" element={<PrivateRoute><Note /></PrivateRoute>} />
          <Route path="add-note" element={<PrivateRoute><AddNote /></PrivateRoute>} />
          <Route path="note/:id" element={<PrivateRoute><NoteDetail /></PrivateRoute>} />
          <Route path="edit-note/:id" element={<PrivateRoute><EditNote /></PrivateRoute>} />
          {/* --- End Notes Routes --- */}

          {/* =========================================== */}
          {/* --- RUTE DATA MAHASISWA --- */}
          {/* =========================================== */}
          <Route
            path="data-mahasiswa" // Daftar semua mahasiswa (bisa diakses user & admin)
            element={
              <PrivateRoute>
                <DataMahasiswaPage />
              </PrivateRoute>
            }
          />
          <Route
            path="data-mahasiswa/tambah" // Menambah mahasiswa baru (hanya admin)
            element={
              // Jika PrivateRoute Anda mendukung prop 'requiredRole'
              <PrivateRoute requiredRole="admin">
                <AddDataMahasiswaPage />
              </PrivateRoute>
              // Jika PrivateRoute tidak mendukung 'requiredRole',
              // proteksi akan ada di dalam komponen AddDataMahasiswaPage
              // <PrivateRoute>
              //   <AddDataMahasiswaPage />
              // </PrivateRoute>
            }
          />
          <Route
            path="data-mahasiswa/:id" // Melihat detail mahasiswa (bisa diakses user & admin)
            element={
              <PrivateRoute>
                <DataDetailMahasiswaPage />
              </PrivateRoute>
            }
          />
          <Route
            path="data-mahasiswa/edit/:id" // Mengedit mahasiswa (hanya admin)
            element={
              // Jika PrivateRoute Anda mendukung prop 'requiredRole'
              <PrivateRoute requiredRole="admin">
                <EditDataMahasiswaPage />
              </PrivateRoute>
              // Jika tidak:
              // <PrivateRoute>
              //  <EditDataMahasiswaPage />
              // </PrivateRoute>
            }
          />
          {/* --- END RUTE DATA MAHASISWA --- */}

        </Route> {/* End RootLayout Routes */}
      </Route> // End Base Route
    )
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" /> {/* Pastikan Toaster ada untuk notifikasi */}
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
