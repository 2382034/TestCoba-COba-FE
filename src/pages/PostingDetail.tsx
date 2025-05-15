import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";
// Assuming PostingsFormInput defines the core editable fields
import { PostingsFormInput } from "../components/PostingsForm";
// Import the fetch function if defined and exported in EditPosting.tsx or define here
import { fetchPostingDetail } from "./EditPosting"; // Or define fetchPostingDetail here if preferred

// Define the structure for detailed posting data (can reuse from EditPosting if identical)
interface PostingDetailType extends PostingsFormInput {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  // Add any other specific fields returned by the detail endpoint (e.g., author info)
}

// Async function to delete a posting (can be reused from EditPosting or defined here)
const deletePosting = async (id: string | undefined, token: string | null) => {
    if (!id) throw new Error("Posting ID is missing");
    if (!token) throw new Error("Authentication token is missing");
    return await axios.delete(`/api/postings/${id}`, { // Changed endpoint
      headers: { Authorization: `Bearer ${token}` }
    });
};


const PostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query to fetch posting details
  // Make sure the response structure matches { data: PostingDetailType }
  const { data: postingDetailResponse, isLoading, isError, error: queryError } = useQuery<{ data: PostingDetailType }, Error>({
    queryKey: ["postingDetail", id], // Unique key including the ID
    queryFn: () => fetchPostingDetail(id, getToken()),
    enabled: !!id && !!getToken(),
    // staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  // Mutation to delete the posting
  const deletePostingMutation = useMutation({
    mutationFn: () => deletePosting(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postingList"] });
      queryClient.removeQueries({ queryKey: ["postingDetail", id] });
      navigate("/postings", { replace: true }); // Go back to the list page
    },
    onError: (err) => {
        console.error("Error deleting posting:", err);
        setIsDeleteModalOpen(false); // Close modal even on error
         // Consider showing a toast notification for the error
    }
  });

  // Handler to open the delete confirmation modal
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  // Destructure posting data safely
  const posting = postingDetailResponse?.data;

  // --- Render Logic ---

  // Combined Loading state for initial load or delete action
  const isProcessing = isLoading || deletePostingMutation.isPending;

  if (isProcessing) {
    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow">
                 <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{deletePostingMutation.isPending ? 'Deleting Posting...' : 'Loading Posting Details...'}</span>
            </div>
        </div>
    );
  }

  if (isError || !posting) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-md mt-10">
        Failed to load posting details. {(queryError as Error)?.message || 'Posting not found or error occurred.'}
        <Link to="/postings" className="block mt-4 text-indigo-600 hover:underline">Back to All Postings</Link>
      </div>
    );
  }

  // --- Delete Confirmation Modal ---
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the posting "{posting.title}"? This action cannot be undone.
          </p>
          {deletePostingMutation.isError && (
             <p className="text-red-500 text-sm mb-4">Error: {(deletePostingMutation.error as Error)?.message || 'Could not delete posting.'}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition duration-150"
              disabled={deletePostingMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => deletePostingMutation.mutate()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150 flex items-center justify-center min-w-[90px]"
              disabled={deletePostingMutation.isPending}
            >
              {deletePostingMutation.isPending ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };


  // --- Main Detail View ---
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <DeleteConfirmationModal />
        <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
            {posting.imageUrl && (
                <img src={posting.imageUrl} alt={posting.title} className="w-full h-64 md:h-80 object-cover bg-gray-100" />
            )}
            <div className="p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-0 break-words">{posting.title}</h1>
                    <div className="flex gap-3 mt-2 sm:mt-0 flex-shrink-0">
                        <Link
                            to={`/postings/edit/${id}`} // Link to the Edit page
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md flex items-center transition duration-150 text-sm"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                             </svg>
                            Edit
                        </Link>
                        <button
                            onClick={handleDeleteClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-md flex items-center transition duration-150 text-sm"
                            disabled={deletePostingMutation.isPending} // Already handled by overlay, but good practice
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="prose prose-indigo max-w-none text-gray-700 whitespace-pre-line">
                     {/* Render content, potentially handling markdown if needed */}
                     <p>{posting.content}</p>
                </div>

                 {/* Metadata Section */}
                {(posting.createdAt || posting.updatedAt) && (
                    <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-right">
                        {posting.createdAt && <p>Created: {new Date(posting.createdAt).toLocaleString()}</p>}
                        {posting.updatedAt && <p>Last Updated: {new Date(posting.updatedAt).toLocaleString()}</p>}
                    </div>
                )}
            </div>
        </div>
        <Link to="/postings" className="inline-block mt-6 text-indigo-600 hover:underline">← Back to All Postings</Link>
    </div>
  );
};

export default PostingDetail;