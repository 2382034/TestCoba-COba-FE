import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoteForm, { NoteFormInput } from "../components/NoteForm";
import axios from "../utils/AxiosInstance";
import { fetchNoteDetail } from "./NoteDetail";
import { useAuth } from "../utils/AuthProvider";

// Fungsi untuk mengedit note
const editNote = async (data: NoteFormInput, id: string | undefined, token: string | null) => {
  return await axios.put(`/api/note/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Fungsi untuk menghapus note
const deleteNote = async (id: string | undefined, token: string | null) => {
  return await axios.delete(`/api/note/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mutation untuk mengedit note
  const editNoteMutation = useMutation({
    mutationFn: (data: NoteFormInput) => editNote(data, id, getToken()),
    onSuccess: () => {
      // Invalidate dan refetch data
      queryClient.invalidateQueries({ queryKey: ["noteList"] });
      navigate("/note", { replace: true });
    }
  });

  // Query untuk mendapatkan detail note
  const { data: noteDetail, isLoading: isNoteLoading, isError } = useQuery({
    queryKey: ["noteDetail", id],
    queryFn: () => fetchNoteDetail(id, getToken()),
    enabled: !!id && !!getToken(),
    // Nonaktifkan refetch otomatis pada perubahan fokus & interval
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Mutation untuk menghapus note
  const deleteNoteMutation = useMutation({
    mutationFn: () => deleteNote(id, getToken()),
    onSuccess: () => {
      // Invalidate dan refetch data
      queryClient.invalidateQueries({ queryKey: ["noteList"] });
      navigate("/notes", { replace: true });
    }
  });

  // Modal konfirmasi delete
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-lg font-medium mb-3">Confirm Delete</h3>
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteNoteMutation.mutate();
                setIsDeleteModalOpen(false);
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handler untuk tombol delete
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Handler untuk tombol cancel - navigasi ke /notes sesuai struktur routing

  // Menampilkan loading state
  const isLoading = editNoteMutation.isPending || isNoteLoading || deleteNoteMutation.isPending;

  return (
    <div className="relative max-w-3xl mx-auto pb-12">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center bg-white/90 px-6 py-3 rounded-lg shadow-lg">
            <span className="text-lg mr-4 text-gray-800">
              {editNoteMutation.isPending ? "Saving..." : 
               deleteNoteMutation.isPending ? "Deleting..." : "Loading..."}
            </span>
            <svg
              className="animate-spin h-5 w-5 text-gray-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Note</h2>
        
        {isError ? (
          <div className="text-red-500 mb-4">Failed to load note. Please try again.</div>
        ) : (
          <>
            <NoteForm
              isEdit={true}
              mutateFn={editNoteMutation.mutate}
              defaultInputData={noteDetail?.data}
            />
            
            <div className="flex justify-between mt-6">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded flex items-center"
                disabled={deleteNoteMutation.isPending}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-1" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
        
        {editNoteMutation.isError && (
          <div className="text-red-500 mt-4">
            Error saving note: {editNoteMutation.error?.message || "Unknown error"}
          </div>
        )}
        
        {deleteNoteMutation.isError && (
          <div className="text-red-500 mt-4">
            Error deleting note: {deleteNoteMutation.error?.message || "Unknown error"}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditNote;
