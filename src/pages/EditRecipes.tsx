import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query"; // Added UseMutateFunction
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecipesForm, { RecipesFormInput} from "../components/RecipesForm"; // Assuming RecipesFormProps is exported
import axios from "../utils/AxiosInstance";
import { fetchRecipeDetail} from "./RecipesDetail"; // Import fetch function and Type
import { useAuth } from "../utils/AuthProvider";

// Async function to edit/update a recipe
const editRecipe = async (data: RecipesFormInput, id: string | undefined, token: string | null) => {
  if (!id) throw new Error("Recipe ID is missing");
  if (!token) throw new Error("Authentication token is missing");
  const response = await axios.put(`/api/recipes/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Async function to delete a recipe
const deleteRecipe = async (id: string | undefined, token: string | null) => {
    if (!id) throw new Error("Recipe ID is missing");
    if (!token) throw new Error("Authentication token is missing");
    return await axios.delete(`/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
};


const EditRecipes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query to get the current recipe details
  // Note: Adjust the type expected from fetchRecipeDetail if needed
  const { data: recipeDetailResponse, isLoading: isRecipeLoading, isError: isQueryError, error: queryError } = useQuery({
    queryKey: ["recipeDetail", id],
    queryFn: () => fetchRecipeDetail(id, getToken()),
    enabled: !!id && !!getToken(),
    refetchOnWindowFocus: false,
    refetchInterval: false
  });

  // Mutation for saving the edited recipe
  const editRecipeMutation = useMutation<any, Error, RecipesFormInput>({ // Explicit types for mutation
    mutationFn: (data: RecipesFormInput) => editRecipe(data, id, getToken()),
    onSuccess: () => {
      console.log("Recipe updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["recipeList"] });
      queryClient.invalidateQueries({ queryKey: ["recipeDetail", id] });
      navigate(`/recipes/${id}`, { replace: true });
    },
    onError: (err) => {
        console.error("Error updating recipe:", err);
        // Display error to user (e.g., toast notification)
    }
  });

  // Mutation for deleting the recipe
  const deleteRecipeMutation = useMutation<any, Error, void>({ // Explicit types for mutation
    mutationFn: () => deleteRecipe(id, getToken()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipeList"] });
      queryClient.removeQueries({ queryKey: ["recipeDetail", id] });
      navigate("/recipes", { replace: true });
    },
    onError: (err) => {
        console.error("Error deleting recipe:", err);
        setIsDeleteModalOpen(false); // Close modal on error
        // Display error to user (e.g., toast notification)
    }
  });

  // --- Delete Confirmation Modal ---
   const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen) return null;
    // BENAR:
const recipeName = recipeDetailResponse?.data?.name || 'this recipe';
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Deletion</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{recipeName}"? This action cannot be undone.
          </p>
          {deleteRecipeMutation.isError && (
             <p className="text-red-500 text-sm mb-4">Error: {(deleteRecipeMutation.error as Error)?.message || 'Could not delete recipe.'}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition duration-150"
              disabled={deleteRecipeMutation.isPending} // Disable cancel while deleting
            >
              Cancel
            </button>
            <button
              onClick={() => {
                deleteRecipeMutation.mutate();
                // onSuccess/onError handles navigation/closing modal
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150 flex items-center justify-center min-w-[80px]" // Added style for consistent width
              disabled={deleteRecipeMutation.isPending}
            >
              {deleteRecipeMutation.isPending ? (
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

  // Handler for triggering delete (called by the button inside RecipesForm)
  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  // Combined loading state for overlay
  // isRecipeLoading: fetching initial data
  // editRecipeMutation.isPending: saving changes
  // deleteRecipeMutation.isPending: deleting recipe
  const isMutating = editRecipeMutation.isPending || deleteRecipeMutation.isPending;
  const showLoadingOverlay = isRecipeLoading || isMutating;


  // --- Render Logic ---

  return (
    <div className="relative max-w-4xl mx-auto p-4 md:p-8">
      {/* Loading Overlay */}
      {showLoadingOverlay && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center rounded-lg">
           <div className="flex items-center bg-white/95 px-8 py-4 rounded-lg shadow-xl border border-gray-200">
            <span className="text-xl mr-4 text-gray-800 font-medium">
              {editRecipeMutation.isPending ? "Saving..." :
               deleteRecipeMutation.isPending ? "Deleting..." :
               isRecipeLoading ? "Loading Recipe..." : "" /* Should not be empty if overlay is shown */}
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

      {/* Form Container - Optionally disable interaction during mutation via overlay */}
      <div className={`bg-white shadow-lg rounded-lg p-6 md:p-10 border border-gray-100 ${isMutating ? 'opacity-70' : ''}`}>
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Edit Recipe</h2>

        {isQueryError ? (
          <div className="text-red-600 text-center p-4 bg-red-50 rounded border border-red-200">
            Failed to load recipe data: {(queryError as Error)?.message || 'Unknown error'}
          </div>
        ) : isRecipeLoading ? (
             // This state is covered by the overlay, but keep a placeholder if needed
             <div className="text-gray-600 text-center py-10">Loading...</div>
        // BENAR:
        ) : !recipeDetailResponse?.data ? (
          <div className="text-gray-600 text-center p-4 bg-yellow-50 rounded border border-yellow-200">
              Recipe data not found or could not be loaded correctly.
          </div>
        // ...
        ) : (
          <>
            {/* Render the form */}
            // BENAR:
              <RecipesForm
                isEdit={true}
                mutateFn={editRecipeMutation.mutate}
                defaultInputData={recipeDetailResponse.data} // <-- Perubahan di sini
                showDeleteButton={true}
                onDelete={handleDelete}
              />

            {/* Display edit mutation errors below the form */}
            {editRecipeMutation.isError && (
              <div className="text-red-500 mt-4 text-center p-3 bg-red-50 rounded border border-red-200">
                Error saving recipe: {(editRecipeMutation.error as Error)?.message || "Unknown error"}
              </div>
            )}
            {/* Delete error is shown inside the modal */}
          </>
        )}
      </div>
    </div>
  );
};

export default EditRecipes;