// src/types/mahasiswa.ts

// Mirroring your DTOs for frontend usage.
// You can make them more specific or share them with backend if using a monorepo.

export interface CreateProdiDto {
    nama_prodi: string;
    fakultas: string;
  }
  
  export interface UpdateProdiDto {
    nama_prodi?: string;
    fakultas?: string;
  }
  
  export interface Prodi {
    id: number;
    nama_prodi: string;
    fakultas: string;
    // Add timestamps if needed
  }
  
  export interface CreateAlamatDto {
    jalan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
  }
  
  export interface UpdateAlamatDto {
    jalan?: string;
    kota?: string;
    provinsi?: string;
    kode_pos?: string;
  }
  
  export interface Alamat {
    id: number; // Assuming Alamat has an ID from the backend entity
    jalan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
    mahasiswa_id: number; // Assuming this is present
    // Add timestamps if needed
  }
  
  export interface CreateMahasiswaDto {
    nama: string;
    nim: string;
    foto?: string; // Path after upload, or file object before upload
    prodi_id: number;
    alamat: CreateAlamatDto;
  }
  
  export interface UpdateMahasiswaDto {
    nama?: string;
    nim?: string;
    // foto is handled by a separate endpoint, so not typically in this DTO for frontend to backend
    // But if you update foto string directly (path), include it:
    foto?: string | null;
    prodi_id?: number | null;
    alamat?: UpdateAlamatDto | null;
  }
  
  export interface Mahasiswa {
    id: number;
    nama: string;
    nim: string;
    foto: string | null;
    prodi: Prodi | null;
    prodi_id: number | null;
    alamat: Alamat | null;
    // created_at?: string; // Opsional
    // updated_at?: string; // Opsional
  }
  
  export enum SortMahasiswaBy {
    NAMA = 'nama',
    NIM = 'nim',
  }
  
  export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
  }
  
  export interface FindMahasiswaQueryDto {
    search?: string;
    prodi_id?: number;
    sortBy?: SortMahasiswaBy;
    sortOrder?: SortOrder;
    page?: number;
    limit?: number;
  }

  export interface PaginatedMahasiswaResponse {
    data: Mahasiswa[]; // Pastikan ini adalah array dari Mahasiswa
    count: number;
    currentPage: number; // Anda mungkin juga punya ini dari backend
    totalPages: number;
  }