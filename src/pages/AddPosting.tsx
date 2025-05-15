import { useMutation, useQueryClient } from "@tanstack/react-query";
import PostingsForm, { PostingsFormInput } from "../components/PostingsForm";
// Corrected Imports:
import axios from "../utils/AxiosInstance";    // Your configured instance for making requests
import { AxiosResponse } from 'axios';         // The TYPE definition from the axios library
// import { useEffect } from "react"; // Removed unused import
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider";

// Define the expected structure of the data returned by the API on successful POST
// Adjust this based on what your /api/postings endpoint actually returns
type AddPostingApiResponse = {
  id: number;
  // include other fields returned by the API if necessary
};

// Async function to add a posting via API
// Explicitly type the return promise to AxiosResponse<AddPostingApiResponse>
// Uses the 'axios' instance imported from ../utils/AxiosInstance
const addPosting = async (data: PostingsFormInput, token: string | null): Promise<AxiosResponse<AddPostingApiResponse>> => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  // Adjust the endpoint as per your API design
  return await axios.post<AddPostingApiResponse>("/api/postings", data, { // Specify expected response type T in axios.post<T>
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const AddPosting = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Add explicit types to useMutation for better type safety:
  const { mutate, isPending, error } = useMutation<
    AxiosResponse<AddPostingApiResponse>, // Type of success response from mutationFn
    Error,                            // Type of error
    PostingsFormInput                 // Type of variables passed to mutate()
  >({
    mutationFn: (data: PostingsFormInput) => addPosting(data, getToken()), // Pass token here
    onSuccess: (response) => { // response is now correctly typed as AxiosResponse<AddPostingApiResponse>
        console.log("Posting added:", response.data);
        queryClient.invalidateQueries({ queryKey: ['postingList'] });
        navigate("/postings", { replace: true });
    },
    onError: (err) => {
        console.error("Error adding posting:", err);
    }
  });

  // Function to get a safe error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred.";
  };

  return (
    <div className="relative max-w-4xl mx-auto p-4 md:p-8">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center bg-white/95 px-8 py-4 rounded-lg shadow-xl border border-gray-200">
            <span className="text-xl mr-4 text-gray-800 font-medium">Adding Posting...</span>
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6 md:p-10 border border-gray-100">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Add New Posting</h2>
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                Error adding posting: {getErrorMessage(error)}
            </div>
        )}
        <PostingsForm
            isEdit={false}
            mutateFn={mutate}
            isMutating={isPending} // Pass mutation pending state
        />
      </div>
    </div>
  );
};

export default AddPosting;