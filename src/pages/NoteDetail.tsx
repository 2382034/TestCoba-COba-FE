import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import NoteForm, { NoteFormInput } from "../components/NoteForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

interface NoteDetail {
  id: number;
  title: string;
  content: string;
  meta?: {
    createdAt: string;
    updatedAt: string;
  };
}


// Fungsi untuk update note
const editNote = async (data: NoteFormInput, id: string | undefined, token: string | null) => {
  return await axios.put(`/api/note/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fungsi untuk hapus note
const deleteNote = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/note/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fungsi untuk fetch detail note
export const fetchNoteDetail = async (id: string | undefined, token: string | null) => {
  return await axios.get(`/api/note/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const NoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query detail note
  const { data: noteDetail, isLoading, isError } = useQuery({
    queryKey: ["noteDetail", id],
    queryFn: () => fetchNoteDetail(id, getToken()),
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Mutation update note
  const editNoteMutation = useMutation({
    mutationFn: (data: NoteFormInput) => editNote(data, id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteList"] });
      navigate("/note", { replace: true });
    }
  });

  // Mutation hapus note
  const deleteNoteMutation = useMutation({
    mutationFn: () => deleteNote(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["noteList"] });
      navigate("/note", { replace: true });
    }
  });

  // Modal konfirmasi hapus
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-3">Konfirmasi Hapus</h3>
          <p className="text-gray-600 mb-4">
            Apakah Anda yakin ingin menghapus note ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Batal
            </button>
            <button
              onClick={() => {
                deleteNoteMutation.mutate();
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handler hapus
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Loading state
  const isAnyLoading = isLoading || editNoteMutation.isPending || deleteNoteMutation.isPending;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#f7fafd]">
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg p-8 border-2 border-purple-300">
        <h2 className="text-2xl font-bold text-center mb-6">Edit Note</h2>
        {isAnyLoading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-lg">
            <span className="text-lg text-gray-700">Loading...</span>
          </div>
        )}
        <DeleteConfirmationModal />
        {isError && (
          <div className="text-red-500 mb-4">Gagal memuat note. Silakan coba lagi.</div>
        )}
        {!isError && (!noteDetail || !noteDetail.data) && (
          <div className="text-gray-500 text-center py-8">Data note tidak ditemukan atau masih dimuat.<br/>Silakan cek koneksi atau API.</div>
        )}
        {!isError && noteDetail && noteDetail.data && (
          <>
            <NoteForm
              isEdit={true}
              mutateFn={editNoteMutation.mutate}
              defaultInputData={noteDetail.data}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded"
                disabled={deleteNoteMutation.isPending}
              >
                Delete
              </button>
            </div>
            {editNoteMutation.isError && (
              <div className="text-red-500 mt-4">
                Error saat menyimpan: {editNoteMutation.error?.message || "Unknown error"}
              </div>
            )}
            {deleteNoteMutation.isError && (
              <div className="text-red-500 mt-4">
                Error saat menghapus: {deleteNoteMutation.error?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NoteDetail;
