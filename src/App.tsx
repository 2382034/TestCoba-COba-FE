// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
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

// --- Halaman lainnya diimpor seperti sebelumnya ---
import Recipes from "./pages/Recipes";
import AddRecipes from "./pages/AddRecipes";
// ... (impor halaman Recipes, Postings, Note lainnya) ...
import EditNote from "./pages/EditNote";

import DataMahasiswaPage from "./pages/Data";
import AddDataMahasiswaPage from "./pages/AddData";
import EditDataMahasiswaPage from "./pages/EditData";
import DataDetailMahasiswaPage from "./pages/DataDetail";

// Utils & Providers
// import PrivateRoute from "./utils/PrivateRoute"; // <<---- DIKOMENTARI
import PublicRoute from "./utils/PublicRoute"; // PublicRoute mungkin masih relevan untuk /login dan /register
import { AuthProvider } from "./utils/AuthProvider";
import Postings from "./pages/Postings";
import AddPosting from "./pages/AddPosting";
import PostingDetail from "./pages/PostingDetail";
import EditPosting from "./pages/EditPosting";
import RecipesDetail from "./pages/RecipesDetail";
import EditRecipes from "./pages/EditRecipes";
import Note from "./pages/Note";
import AddNote from "./pages/AddNote";
import NoteDetail from "./pages/NoteDetail";

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
              <PublicRoute> {/* Biarkan PublicRoute jika fungsinya untuk redirect jika sudah login */}
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="register"
            element={
              <PublicRoute> {/* Biarkan PublicRoute */}
                <Register />
              </PublicRoute>
            }
          />
        </Route>

        {/* "Private" Layout menjadi dapat diakses */}
        <Route path="/" element={<RootLayout />}>
          {/* Home */}
          <Route
            index
            element={<Home />} // <<---- Hapus PrivateRoute
          />

          {/* --- Postings Routes --- */}
          <Route path="postings" element={<Postings />} />
          <Route path="add-posting" element={<AddPosting />} />
          <Route path="postings/:id" element={<PostingDetail />} />
          <Route path="postings/edit/:id" element={<EditPosting />} />

          {/* --- Recipes Routes --- */}
          <Route path="recipes" element={<Recipes />} />
          <Route path="add-recipe" element={<AddRecipes />} />
          <Route path="recipes/:id" element={<RecipesDetail />} />
          <Route path="recipes/edit/:id" element={<EditRecipes />} />

          {/* --- Notes Routes --- */}
          <Route path="note" element={<Note />} />
          <Route path="add-note" element={<AddNote />} />
          <Route path="note/:id" element={<NoteDetail />} />
          <Route path="edit-note/:id" element={<EditNote />} />

          {/* --- RUTE DATA MAHASISWA --- */}
          <Route
            path="data-mahasiswa"
            element={<DataMahasiswaPage />} // <<---- Hapus PrivateRoute
          />
          <Route
            path="data-mahasiswa/tambah"
            element={<AddDataMahasiswaPage />} // <<---- Hapus PrivateRoute
          />
          <Route
            path="data-mahasiswa/:id"
            element={<DataDetailMahasiswaPage />} // <<---- Hapus PrivateRoute
          />
          <Route
            path="data-mahasiswa/edit/:id"
            element={<EditDataMahasiswaPage />} // <<---- Hapus PrivateRoute
          />
        </Route>
      </Route>
    )
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;