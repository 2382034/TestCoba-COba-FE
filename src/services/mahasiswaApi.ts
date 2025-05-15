// src/services/mahasiswaApi.ts
import axios from 'axios';
import {
  CreateMahasiswaDto,
  UpdateMahasiswaDto,
  FindMahasiswaQueryDto,
  Prodi,
  Mahasiswa,
  PaginatedMahasiswaResponse, // Add this if it wasn't already there
} from '../types/mahasiswa';// We'll define these types next

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Use Vite env var

// Define simplified types matching your DTOs for frontend use
// You might want to generate these from your backend or define them more comprehensively



const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/data`, // Corresponds to @Controller('data')
});

// Helper to get token if you use authentication
// const getToken = () => localStorage.getItem('authToken');
// apiClient.interceptors.request.use(config => {
//   const token = getToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });


// --- Prodi API ---
export const fetchProdiList = async (): Promise<Prodi[]> => {
  const response = await apiClient.get<Prodi[]>('/prodi');
  return response.data;
};

// You can add createProdi, updateProdi, deleteProdi if needed for admin UI

// --- Mahasiswa API ---
export const fetchMahasiswaList = async (query: FindMahasiswaQueryDto): Promise<PaginatedMahasiswaResponse> => {
  const response = await apiClient.get<PaginatedMahasiswaResponse>('/mahasiswa', { params: query });
  return response.data;
};

export const fetchMahasiswaById = async (id: number): Promise<Mahasiswa> => {
  const response = await apiClient.get<Mahasiswa>(`/mahasiswa/${id}`);
  return response.data;
};

export const createMahasiswa = async (data: CreateMahasiswaDto): Promise<Mahasiswa> => {
  const response = await apiClient.post<Mahasiswa>('/mahasiswa', data);
  return response.data;
};

export const updateMahasiswa = async (id: number, data: UpdateMahasiswaDto): Promise<Mahasiswa> => {
  // The backend DTO allows prodi_id: null and alamat: null
  // Ensure your data structure matches this for clearing fields.
  const response = await apiClient.patch<Mahasiswa>(`/mahasiswa/${id}`, data);
  return response.data;
};

export const deleteMahasiswa = async (id: number): Promise<void> => {
  await apiClient.delete(`/mahasiswa/${id}`);
};

export const uploadMahasiswaFoto = async (id: number, foto: File): Promise<Mahasiswa> => {
  const formData = new FormData();
  formData.append('foto', foto);
  const response = await apiClient.post<Mahasiswa>(`/mahasiswa/${id}/foto`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Utility to get foto URL
// Di mahasiswaApi.ts
export const getMahasiswaFotoUrl = (filename: string | null | undefined): string | undefined => {
  if (!filename) return undefined;
  return `${API_BASE_URL}/uploads/mahasiswa-fotos/${filename}`;
};

