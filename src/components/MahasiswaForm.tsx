// src/components/mahasiswa/MahasiswaForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller, FieldError } from 'react-hook-form'; // Impor FieldError
import { useQuery } from '@tanstack/react-query';
import { fetchProdiList, getMahasiswaFotoUrl } from '../services/mahasiswaApi';
import { Mahasiswa, Prodi } from '../types/mahasiswa'; // Hapus DTO yang tidak digunakan di sini

export interface MahasiswaFormData {
  nama: string;
  nim: string;
  prodi_id: number | null; // Simpan sebagai number atau null
  alamat: {
    jalan: string;
    kota: string;
    provinsi: string;
    kode_pos: string;
  };
  fotoFile?: FileList | null;
}

interface MahasiswaFormProps {
  onSubmit: SubmitHandler<MahasiswaFormData>;
  initialData?: Mahasiswa | null;
  isSubmitting: boolean;
  submitButtonText?: string;
}

const MahasiswaForm: React.FC<MahasiswaFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText = 'Submit',
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MahasiswaFormData>({
    defaultValues: {
      nama: '',
      nim: '',
      prodi_id: null, // Default ke null
      alamat: {
        jalan: '',
        kota: '',
        provinsi: '',
        kode_pos: '',
      },
      fotoFile: null,
    },
  });

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fotoFileWatcher = watch('fotoFile');

  const { data: prodiList, isLoading: isLoadingProdi } = useQuery<Prodi[]>({
    queryKey: ['prodiList'],
    queryFn: fetchProdiList,
  });

  useEffect(() => {
    if (initialData) {
      reset({
        nama: initialData.nama,
        nim: initialData.nim,
        prodi_id: initialData.prodi_id ?? null, // Gunakan null jika prodi_id undefined/null
        alamat: {
          jalan: initialData.alamat?.jalan || '',
          kota: initialData.alamat?.kota || '',
          provinsi: initialData.alamat?.provinsi || '',
          kode_pos: initialData.alamat?.kode_pos || '',
        },
        fotoFile: null,
      });
      if (initialData.foto) {
        setFotoPreview(getMahasiswaFotoUrl(initialData.foto) || null);
      } else {
        setFotoPreview(null);
      }
    } else {
      reset({ // Pastikan reset untuk form pembuatan
        nama: '',
        nim: '',
        prodi_id: null,
        alamat: { jalan: '', kota: '', provinsi: '', kode_pos: '' },
        fotoFile: null,
      });
      setFotoPreview(null);
    }
  }, [initialData, reset]);

  useEffect(() => {
    // ... (logika fotoPreview terlihat oke, pastikan getMahasiswaFotoUrl menangani null/undefined dengan baik)
    if (fotoFileWatcher && fotoFileWatcher.length > 0) {
      const file = fotoFileWatcher[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (fotoFileWatcher && fotoFileWatcher.length === 0) {
      setFotoPreview(initialData?.foto ? (getMahasiswaFotoUrl(initialData.foto) || null) : null);
    }
  }, [fotoFileWatcher, initialData]);


  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500";
  const labelStyle = "block text-sm font-medium text-slate-700";
  const errorStyle = "mt-1 text-xs text-red-500";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow-md rounded-lg">
      {/* Nama */}
      <div>
        <label htmlFor="nama" className={labelStyle}>Nama Mahasiswa</label>
        <input id="nama" type="text" {...register('nama', { required: 'Nama wajib diisi' })} className={inputStyle} disabled={isSubmitting} />
        {errors.nama && <p className={errorStyle}>{errors.nama.message}</p>}
      </div>

      {/* NIM */}
      <div>
        <label htmlFor="nim" className={labelStyle}>NIM</label>
        <input id="nim" type="text" {...register('nim', { required: 'NIM wajib diisi' })} className={inputStyle} disabled={isSubmitting} />
        {errors.nim && <p className={errorStyle}>{errors.nim.message}</p>}
      </div>

      {/* Prodi ID */}
      <div>
        <label htmlFor="prodi_id" className={labelStyle}>Program Studi</label>
        <Controller
          name="prodi_id"
          control={control}
          rules={{ validate: (value) => value !== null || 'Prodi wajib dipilih' }} // Validasi terhadap null
          render={({ field }) => (
            <select
              id="prodi_id"
              {...field}
              value={field.value === null ? '' : field.value} // Gunakan '' untuk <option value="">
              onChange={(e) => {
                const val = e.target.value;
                field.onChange(val === '' ? null : Number(val)); // Set ke null atau number
              }}
              className={inputStyle}
              disabled={isSubmitting || isLoadingProdi}
            >
              <option value="">Pilih Prodi</option>
              {prodiList?.map((prodi) => (
                <option key={prodi.id} value={prodi.id}>
                  {prodi.nama_prodi}
                </option>
              ))}
            </select>
          )}
        />
        {errors.prodi_id && <p className={errorStyle}>{(errors.prodi_id as FieldError).message}</p>}
      </div>


      {/* Fieldset Alamat */}
      <fieldset className="border p-4 rounded-md">
        <legend className="text-lg font-medium text-slate-900 px-1">Alamat</legend>
        <div className="space-y-4 mt-2">
          <div>
            <label htmlFor="alamat.jalan" className={labelStyle}>Jalan</label>
            <input id="alamat.jalan" type="text" {...register('alamat.jalan', { required: 'Jalan wajib diisi' })} className={inputStyle} disabled={isSubmitting} />
            {errors.alamat?.jalan && <p className={errorStyle}>{errors.alamat.jalan.message}</p>}
          </div>
          <div>
            <label htmlFor="alamat.kota" className={labelStyle}>Kota</label>
            <input id="alamat.kota" type="text" {...register('alamat.kota', { required: 'Kota wajib diisi' })} className={inputStyle} disabled={isSubmitting} />
            {errors.alamat?.kota && <p className={errorStyle}>{errors.alamat.kota.message}</p>}
          </div>
          <div>
            <label htmlFor="alamat.provinsi" className={labelStyle}>Provinsi</label>
            <input id="alamat.provinsi" type="text" {...register('alamat.provinsi', { required: 'Provinsi wajib diisi' })} className={inputStyle} disabled={isSubmitting}/>
            {errors.alamat?.provinsi && <p className={errorStyle}>{errors.alamat.provinsi.message}</p>}
          </div>
          <div>
            <label htmlFor="alamat.kode_pos" className={labelStyle}>Kode Pos</label>
            <input id="alamat.kode_pos" type="text" {...register('alamat.kode_pos', { required: 'Kode Pos wajib diisi', pattern: { value: /^\d{5}$/, message: 'Kode Pos harus 5 digit angka' } })} className={inputStyle} disabled={isSubmitting} />
            {errors.alamat?.kode_pos && <p className={errorStyle}>{errors.alamat.kode_pos.message}</p>}
          </div>
        </div>
      </fieldset>

      {/* File Foto */}
      <div>
        <label htmlFor="fotoFile" className={labelStyle}>Foto Mahasiswa</label>
        <input id="fotoFile" type="file" accept="image/*" {...register('fotoFile')} className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} disabled={isSubmitting} />
        {fotoPreview && (
          <div className="mt-4">
            <p className="text-sm text-slate-600">Preview:</p>
            <img src={fotoPreview} alt="Foto preview" className="mt-2 max-h-48 w-auto object-contain border rounded" />
          </div>
        )}
        {errors.fotoFile && <p className={errorStyle}>{errors.fotoFile.message}</p>}
      </div>

      {/* Tombol Submit */}
      <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400">
        {isSubmitting ? 'Menyimpan...' : submitButtonText}
      </button>
    </form>
  );
};

export default MahasiswaForm;