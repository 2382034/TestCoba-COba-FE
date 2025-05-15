import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import axios from "../utils/AxiosInstance";
import { useAuth } from "../utils/AuthProvider";
import { RecipesFormInput } from "../components/RecipesForm"; // Import type if needed

// Define the structure for detailed recipe data from API
interface RecipeDetailType extends RecipesFormInput {
  id: number;
  userId?: number; // Tambahkan jika perlu
  createdAt?: string; // Pindahkan dari meta
  updatedAt?: string; // Pindahkan dari meta
  // Hapus meta jika tidak digunakan lagi:
  // meta?: {
  //   createdAt: string;
  //   updatedAt: string;
  // };
}

// Async function to fetch recipe details
export const fetchRecipeDetail = async (id: string | undefined, token: string | null) => {
  // ... (checks for id and token)
  // Adjust API endpoint and generic type
  // OLD: return await axios.get<{ data: RecipeDetailType }>(`/api/recipes/${id}`, { ... });
  return await axios.get<RecipeDetailType>(`/api/recipes/${id}`, { // <-- Ubah di sini
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Async function to delete a recipe
const deleteRecipe = async (id: string | undefined, token: string | null) => {
    if (!id) throw new Error("Recipe ID is missing");
    if (!token) throw new Error("Authentication token is missing");
    // Adjust API endpoint
    return await axios.delete(`/api/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
};


const RecipesDetail = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from URL
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query to fetch recipe details
  const { data: recipeDetailResponse, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["recipeDetail", id], // Unique key including the ID
    queryFn: () => fetchRecipeDetail(id, getToken()),
    enabled: !!id && !!getToken(), // Only run query if ID and token exist
    refetchOnWindowFocus: false, // Optional: prevent refetch on focus
  });

  // Mutation to delete the recipe
  const deleteRecipeMutation = useMutation({
    mutationFn: () => deleteRecipe(id, getToken()),
    onSuccess: () => {
      // Invalidate the list query so the list updates
      queryClient.invalidateQueries({ queryKey: ["recipeList"] });
      // Optionally invalidate the specific detail query if needed elsewhere
      // queryClient.invalidateQueries({ queryKey: ["recipeDetail", id] });
      navigate("/recipes", { replace: true }); // Go back to the list page
    },
    onError: (err) => {
        console.error("Error deleting recipe:", err);
        // Handle error display
        setIsDeleteModalOpen(false); // Close modal even on error
    }
  });

  // Handler to open the delete confirmation modal
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  // Destructure recipe data safely
  const recipe = recipeDetailResponse?.data; // Adjust based on your actual API response structure
  const totalTime = recipe ? recipe.prepTime + recipe.cookTime : 0;

  // --- Render Logic ---

  if (isLoading || deleteRecipeMutation.isPending) {
    return (
        <div className="flex justify-center items-center min-h-[70vh]">
            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow">
                 <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{deleteRecipeMutation.isPending ? 'Deleting...' : 'Loading Recipe Details...'}</span>
            </div>
        </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="p-6 text-center text-red-600">
        Failed to load recipe details. {(queryError as Error)?.message || 'Recipe not found or error occurred.'}
        <Link to="/recipes" className="block mt-4 text-indigo-600 hover:underline">Back to Recipes</Link>
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
            Are you sure you want to delete the recipe "{recipe.name}"? This action cannot be undone.
          </p>
          {deleteRecipeMutation.isError && (
             <p className="text-red-500 text-sm mb-4">Error: {(deleteRecipeMutation.error as Error)?.message || 'Could not delete recipe.'}</p>
          )}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition duration-150"
              disabled={deleteRecipeMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteRecipeMutation.mutate()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-150"
              disabled={deleteRecipeMutation.isPending}
            >
              {deleteRecipeMutation.isPending ? 'Deleting...' : 'Delete'}
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
            {recipe.imageUrl && (
                <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-64 object-cover" />
            )}
            <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-0">{recipe.name}</h1>
                    <div className="flex gap-3 mt-2 sm:mt-0">
                        <Link
                            to={`/recipes/edit/${id}`} // Link to the Edit page
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-md flex items-center transition duration-150"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                             </svg>
                            Edit
                        </Link>
                        <button
                            onClick={handleDeleteClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-md flex items-center transition duration-150"
                            disabled={deleteRecipeMutation.isPending}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>

                <p className="text-gray-600 mb-6 text-lg">{recipe.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center border-t border-b border-gray-200 py-4">
                    <div>
                        <span className="block text-sm font-medium text-gray-500">Prep Time</span>
                        <span className="text-lg font-semibold text-gray-700">{recipe.prepTime} min</span>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-500">Cook Time</span>
                        <span className="text-lg font-semibold text-gray-700">{recipe.cookTime} min</span>
                    </div>
                    <div>
                        <span className="block text-sm font-medium text-gray-500">Total Time</span>
                        <span className="text-lg font-semibold text-gray-700">{totalTime} min</span>
                    </div>
                     {recipe.servings && (
                        <div className="sm:col-span-1"> {/* Adjust grid placement if needed */}
                             <span className="block text-sm font-medium text-gray-500">Servings</span>
                             <span className="text-lg font-semibold text-gray-700">{recipe.servings}</span>
                        </div>
                     )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h2>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 whitespace-pre-line">
                            {/* Process ingredients string into list items */}
                            {recipe.ingredients.split('\n').map((item, index) => item.trim() && <li key={index}>{item.trim()}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Instructions</h2>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                            {/* Process instructions string, maybe wrap in <p> tags per step */}
                             {recipe.instructions.split('\n').map((step, index) => step.trim() && <p key={index}>{step.trim()}</p>)}
                        </div>
                    </div>
                </div>

                 {/* Ganti pengecekan dan akses ke field langsung */}
{recipe.createdAt && recipe.updatedAt && ( // Cek apakah field createdAt dan updatedAt ada di recipe
    <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-right">
        {/* Akses createdAt dan updatedAt langsung dari recipe */}
        <p>Created: {new Date(recipe.createdAt).toLocaleString()}</p>
        <p>Last Updated: {new Date(recipe.updatedAt).toLocaleString()}</p>
    </div>
)}
            </div>
        </div>
        <Link to="/recipes" className="inline-block mt-6 text-indigo-600 hover:underline">← Back to All Recipes</Link>
    </div>
  );
};

export default RecipesDetail;