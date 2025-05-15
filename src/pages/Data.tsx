// src/pages/Data.tsx  <-- Asumsi lokasi file Anda
import React, { useState } from 'react';
// Pastikan impor keepPreviousData jika menggunakan v5+
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom'; // useNavigate tidak digunakan, bisa dihapus
import toast from 'react-hot-toast';
import {
  fetchMahasiswaList,
  deleteMahasiswa,
  fetchProdiList,
  getMahasiswaFotoUrl
} from '../services/mahasiswaApi'; // DIPERBAIKI: ../
import {
  Mahasiswa,
  Prodi,
  FindMahasiswaQueryDto,
  SortMahasiswaBy,
  SortOrder,
  PaginatedMahasiswaResponse
} from '../types/mahasiswa'; // DIPERBAIKI: ../
import { useAuth } from '../utils/AuthProvider'; // DIPERBAIKI: ../

const ITEMS_PER_PAGE = 10;

const DataMahasiswaPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProdiId, setFilterProdiId] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortMahasiswaBy>(SortMahasiswaBy.NAMA);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  const queryParams: FindMahasiswaQueryDto = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchTerm || undefined,
    prodi_id: filterProdiId || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  const { data: prodiList } = useQuery<Prodi[], Error>({
    queryKey: ['prodiList'],
    queryFn: fetchProdiList,
  });

  const {
    data: mahasiswaPaginatedData,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<PaginatedMahasiswaResponse, Error>({
    queryKey: ['mahasiswaList', queryParams],
    queryFn: () => fetchMahasiswaList(queryParams),
    // Untuk TanStack Query v4:
    // keepPreviousData: true,
    // Untuk TanStack Query v5+: (pastikan keepPreviousData diimpor dari @tanstack/react-query)
    placeholderData: keepPreviousData,
  });

  const mahasiswaList: Mahasiswa[] = mahasiswaPaginatedData?.data || [];
  const totalCount: number = mahasiswaPaginatedData?.count || 0;
  const totalPages: number = mahasiswaPaginatedData?.totalPages || 1;

  const deleteMutation = useMutation<void, Error, number>({
    mutationFn: deleteMahasiswa,
    onSuccess: () => {
      toast.success('Mahasiswa berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: ['mahasiswaList'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || 'Gagal menghapus mahasiswa.');
    },
  });

  const handleDelete = (id: number, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus mahasiswa "${nama}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterProdiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : undefined;
    setFilterProdiId(value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortMahasiswaBy);
    setCurrentPage(1);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as SortOrder);
    setCurrentPage(1);
  };

  // useEffect untuk refetch tidak lagi diperlukan karena queryParams ada di queryKey
  // React Query akan menangani refetch secara otomatis.

  const buttonStyle = "px-4 py-2 text-sm font-medium rounded-md";
  const primaryButtonStyle = `${buttonStyle} text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`;
  const secondaryButtonStyle = `${buttonStyle} text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2`;
  const dangerButtonStyle = `${buttonStyle} text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`;

  // Gunakan isLoading untuk loading awal, isFetching untuk update di background
  if (isLoading) return <div className="text-center p-10">Memuat data mahasiswa...</div>;
  if (isError && !mahasiswaPaginatedData) return <div className="text-center p-10 text-red-500">Error: {(error as any)?.message || 'Gagal memuat data.'}</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      {isFetching && !isLoading && ( // Tampilkan feedback jika sedang fetching di background
        <div className="text-center text-sm text-slate-500 mb-2">Memperbarui data...</div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Daftar Mahasiswa</h1>
        {isAdmin && (
          <Link to="/data-mahasiswa/tambah" className={primaryButtonStyle}>
            Tambah Mahasiswa
          </Link>
        )}
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-700">
              Cari (Nama/NIM)
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Ketik untuk mencari..."
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
          <div>
            <label htmlFor="filterProdi" className="block text-sm font-medium text-slate-700">
              Filter Prodi
            </label>
            <select
              id="filterProdi"
              value={filterProdiId || ''}
              onChange={handleFilterProdiChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Semua Prodi</option>
              {prodiList?.map((prodi) => (
                <option key={prodi.id} value={prodi.id}>
                  {prodi.nama_prodi}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-slate-700">
              Urutkan Berdasarkan
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value={SortMahasiswaBy.NAMA}>Nama</option>
              <option value={SortMahasiswaBy.NIM}>NIM</option>
            </select>
          </div>
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700">
              Urutan
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={handleOrderChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            >
              <option value={SortOrder.ASC}>Ascending (A-Z)</option>
              <option value={SortOrder.DESC}>Descending (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mahasiswa Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Foto</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Nama</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">NIM</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Prodi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Alamat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {(mahasiswaList.length > 0) ? (
              mahasiswaList.map((mhs) => (
                <tr key={mhs.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={getMahasiswaFotoUrl(mhs.foto) || 'https://via.placeholder.com/50'}
                      alt={mhs.nama}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{mhs.nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{mhs.nim}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{mhs.prodi?.nama_prodi || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {mhs.alamat ? `${mhs.alamat.jalan}, ${mhs.alamat.kota}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link to={`/data-mahasiswa/${mhs.id}`} className={`${secondaryButtonStyle} !py-1 !px-2`}>
                        Detail
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/data-mahasiswa/edit/${mhs.id}`} className={`${primaryButtonStyle} !py-1 !px-2 !bg-yellow-500 hover:!bg-yellow-600`}>
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(mhs.id, mhs.nama)}
                            // Gunakan isPending dari deleteMutation jika TanStack Query v5+
                            disabled={deleteMutation.isPending && deleteMutation.variables === mhs.id}
                            className={`${dangerButtonStyle} !py-1 !px-2`}
                          >
                            {(deleteMutation.isPending && deleteMutation.variables === mhs.id) ? '...' : 'Hapus'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {isError ? "Gagal memuat data atau tidak ada data." : "Tidak ada data mahasiswa yang ditemukan."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-slate-700">
            Halaman {currentPage} dari {totalPages} (Total {totalCount} data)
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isFetching } // Gunakan isFetching agar tombol disable saat data baru dimuat
              className={`${secondaryButtonStyle} disabled:opacity-50`}
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isFetching } // Gunakan isFetching
              className={`${secondaryButtonStyle} disabled:opacity-50`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataMahasiswaPage;