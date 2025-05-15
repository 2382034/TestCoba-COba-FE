import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PostingsForm, { PostingsFormInput } from "../components/PostingsForm";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";

// Define the structure for detailed posting data from API (matching form + id/timestamps)
interface PostingDetailType extends PostingsFormInput {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

// Async function to fetch posting details
// Exporting allows reuse in PostingDetail.tsx
export const fetchPostingDetail = async (id: string | undefined, token: string | null): Promise<{ data: PostingDetailType }> => {
  if (!id) throw new Error("Posting ID is missing");
  if (!token) throw new Error("Authentication token is missing");
  // Adjust API endpoint and expected response structure
  return await axios.get(`/api/postings/${id}`, { // Changed endpoint
    headers: { Authorization: `Bearer ${token}` }
  });
};


// Async function to edit/update a posting
const editPosting = async (data: PostingsFormInput, id: string | undefined, token: string | null) => {
  if (!id) throw new Error("Posting ID is missing");
  if (!token) throw new Error("Authentication token is missing");
  const response = await axios.put(`/api/postings/${id}`, data, { // Changed endpoint
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Async function to delete a posting
const deletePosting = async (id: string | undefined, token: string | null) => {
    if (!id) throw new Error("Posting ID is missing");
    if (!token) throw new Error("Authentication token is missing");
    return await axios.delete(`/api/postings/${id}`, { // Changed endpoint
      headers: { Authorization: `Bearer ${token}` }
    });
};


const EditPosting = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query to get the current posting details
  const { data: postingDetailResponse, isLoading: isPostingLoading, isError: isQueryError, error: queryError } = useQuery({
    queryKey: ["postingDetail", id], // Changed query key
    queryFn: () => fetchPostingDetail(id, getToken()),
    enabled: !!id && !!getToken(), // Only run if id and token exist
     // Consider adding staleTime or cacheTime if data doesn't change often
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for saving the edited posting
  const editPostingMutation = useMutation<any, Error, PostingsFormInput>({
    mutationFn: (data: PostingsFormInput) => editPosting(data, id, getToken()),
    onSuccess: () => {
      console.log("Posting updated successfully!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["postingList"] });
      queryClient.invalidateQueries({ queryKey: ["postingDetail", id] });
      navigate(`/postings/${id}`, { replace: true }); // Navigate to detail page
    },
    onError: (err) => {
        console.error("Error updating posting:", err);
        // Display error to user (e.g., toast notification)
    }
  });

  // Mutation for deleting the posting
  const deletePostingMutation = useMutation<any, Error, void>({
    mutationFn: () => deletePosting(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["postingList"] });
      // Remove the specific detail query from cache
      queryClient.removeQueries({ queryKey: ["postingDetail", id] });
      navigate("/postings", { replace: true }); // Navigate back to the list
    },
    onError: (err) => {
        console.error("Error deleting posting:", err);
        setIsDeleteModalOpen(false); // Close modal on error
        // Display error to user (e.g., toast notification)
    }
  });

  // --- Delete Confirmation Modal ---
   const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    // Safely access the title
    const postingTitle = postingDetailResponse?.data?.title || 'this posting';
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{postingTitle}"? This action cannot be undone.
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
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150 flex items-center justify-center min-w-[80px]"
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

  // Handler for triggering delete
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Combined loading state for overlay
  const isMutating = editPostingMutation.isPending || deletePostingMutation.isPending;
  const showLoadingOverlay = isPostingLoading || isMutating;

  // --- Render Logic ---
  return (
    <div className="relative max-w-4xl mx-auto p-4 md:p-8">
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
           <div className="flex items-center bg-white/95 px-8 py-4 rounded-lg shadow-xl border border-gray-200">
            <span className="text-xl mr-4 text-gray-800 font-medium">
              {editPostingMutation.isPending ? "Saving..." :
               deletePostingMutation.isPending ? "Deleting..." :
               isPostingLoading ? "Loading Posting..." : "" }
            </span>
             <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />

      {/* Form Container */}
      <div className={`bg-white shadow-lg rounded-lg p-6 md:p-10 border border-gray-100 ${isMutating ? 'opacity-70 pointer-events-none' : ''}`}>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit Posting</h2>

        {isQueryError ? (
          <div className="text-red-600 text-center p-4 bg-red-50 rounded border border-red-200">
            Failed to load posting data: {(queryError as Error)?.message || 'Unknown error'}
          </div>
        ) : isPostingLoading ? (
             <div className="text-gray-600 text-center py-10">Loading form...</div> // Placeholder while overlay is active
        ) : !postingDetailResponse?.data ? (
          <div className="text-gray-600 text-center p-4 bg-yellow-50 rounded border border-yellow-200">
              Posting data not found or could not be loaded correctly.
          </div>
        ) : (
          <>
            {/* Render the form */}
              <PostingsForm
                isEdit={true}
                mutateFn={editPostingMutation.mutate}
                defaultInputData={postingDetailResponse.data} // Pass fetched data
                showDeleteButton={true}
                onDelete={handleDelete}
                isMutating={isMutating} // Pass combined mutation state
              />

            {/* Display edit mutation errors below the form */}
            {editPostingMutation.isError && (
              <div className="text-red-500 mt-4 text-center p-3 bg-red-50 rounded border border-red-200">
                Error saving posting: {(editPostingMutation.error as Error)?.message || "Unknown error"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EditPosting;