// src/pages/mahasiswa/DataDetail.tsx
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchMahasiswaById, deleteMahasiswa, getMahasiswaFotoUrl } from '../services/mahasiswaApi';
import { Mahasiswa } from '../types/mahasiswa';
import { useAuth } from '../utils/AuthProvider';

const DataDetailMahasiswaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mahasiswaId = parseInt(id!, 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: mahasiswa, isLoading, isError, error } = useQuery<Mahasiswa, Error>({
    queryKey: ['mahasiswa', mahasiswaId],
    queryFn: () => fetchMahasiswaById(mahasiswaId),
    enabled: !!mahasiswaId,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMahasiswa,
    onSuccess: () => {
      toast.success('Mahasiswa berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: ['mahasiswaList']});
      navigate('/data-mahasiswa');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus mahasiswa.');
    },
  });

  const handleDelete = () => {
    if (mahasiswa && window.confirm(`Apakah Anda yakin ingin menghapus mahasiswa "${mahasiswa.nama}"?`)) {
      deleteMutation.mutate(mahasiswa.id);
    }
  };

  const detailItemStyle = "py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0";
  const detailLabelStyle = "text-sm font-medium text-slate-600";
  const detailValueStyle = "mt-1 text-sm text-slate-900 sm:mt-0 sm:col-span-2";

  if (isLoading) return <div className="text-center p-10">Memuat detail mahasiswa...</div>;
  if (isError) return <div className="text-center p-10 text-red-500">Error: {error?.message || 'Gagal memuat detail.'}</div>;
  if (!mahasiswa) return <div className="text-center p-10">Data mahasiswa tidak ditemukan.</div>;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden max-w-3xl mx-auto">
        <div className="md:flex">
          <div className="md:flex-shrink-0 p-6 md:p-0 md:w-1/3 flex justify-center items-center bg-slate-50">
            <img
              className="h-48 w-48 rounded-full object-cover md:h-full md:w-full md:rounded-none md:object-contain p-4"
              src={getMahasiswaFotoUrl(mahasiswa.foto) || 'https://via.placeholder.com/300'}
              alt={`Foto ${mahasiswa.nama}`}
            />
          </div>
          <div className="p-6 md:p-8 flex-grow">
            <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">{mahasiswa.nama}</h1>
                 <button
                    onClick={() => navigate("/data-mahasiswa")} // Or navigate(-1) if appropriate
                    className="text-sm text-blue-600 hover:text-blue-800 mb-4"
                >
                    ← Kembali ke Daftar
                </button>
            </div>
            <p className="text-md text-slate-600 mb-6">NIM: {mahasiswa.nim}</p>

            <dl className="divide-y divide-slate-200">
              <div className={detailItemStyle}>
                <dt className={detailLabelStyle}>Program Studi</dt>
                <dd className={detailValueStyle}>{mahasiswa.prodi?.nama_prodi || 'Tidak ada data'}</dd>
              </div>
              <div className={detailItemStyle}>
                <dt className={detailLabelStyle}>Fakultas</dt>
                <dd className={detailValueStyle}>{mahasiswa.prodi?.fakultas || 'Tidak ada data'}</dd>
              </div>
              {mahasiswa.alamat && (
                <>
                  <div className={detailItemStyle}>
                    <dt className={detailLabelStyle}>Jalan</dt>
                    <dd className={detailValueStyle}>{mahasiswa.alamat.jalan}</dd>
                  </div>
                  <div className={detailItemStyle}>
                    <dt className={detailLabelStyle}>Kota</dt>
                    <dd className={detailValueStyle}>{mahasiswa.alamat.kota}</dd>
                  </div>
                  <div className={detailItemStyle}>
                    <dt className={detailLabelStyle}>Provinsi</dt>
                    <dd className={detailValueStyle}>{mahasiswa.alamat.provinsi}</dd>
                  </div>
                  <div className={detailItemStyle}>
                    <dt className={detailLabelStyle}>Kode Pos</dt>
                    <dd className={detailValueStyle}>{mahasiswa.alamat.kode_pos}</dd>
                  </div>
                </>
              )}
               {!mahasiswa.alamat && (
                 <div className={detailItemStyle}>
                    <dt className={detailLabelStyle}>Alamat</dt>
                    <dd className={detailValueStyle}>Tidak ada data alamat.</dd>
                  </div>
               )}
            </dl>

            {isAdmin && (
              <div className="mt-8 flex space-x-3">
                <Link
                  to={`/data-mahasiswa/edit/${mahasiswa.id}`}
                  className="px-6 py-2 text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                >
                  Edit Mahasiswa
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-6 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-slate-400"
                >
                  {deleteMutation.isPending ? 'Menghapus...' : 'Hapus Mahasiswa'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDetailMahasiswaPage;