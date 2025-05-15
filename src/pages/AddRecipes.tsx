import { useMutation } from "@tanstack/react-query";
import RecipesForm, { RecipesFormInput } from "../components/RecipesForm"; // Adjusted import
import axios from "../utils/AxiosInstance";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthProvider"; // Assuming you need auth

// Async function to add a recipe via API
const addRecipe = async (data: RecipesFormInput, token: string | null) => {
  if (!token) {
    throw new Error("No authentication token found");
  }
  // Adjust the endpoint as per your API design
  return await axios.post("/api/recipes", data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

const AddRecipes = () => {
  const { getToken } = useAuth(); // Get token using your auth provider
  const navigate = useNavigate();

  const { mutate, isSuccess, isPending, error } = useMutation({
    mutationFn: (data: RecipesFormInput) => addRecipe(data, getToken()), // Pass token here
    onSuccess: () => {
        // Optionally invalidate queries if needed immediately elsewhere
        // queryClient.invalidateQueries({ queryKey: ['recipeList'] });
        navigate("/recipes", { replace: true }); // Navigate to the recipes list page on success
    },
    onError: (err) => {
        console.error("Error adding recipe:", err);
        // Handle error display to the user if needed
    }
  });

  useEffect(() => {
    // This navigation is handled by onSuccess now, but kept for reference if needed differently
    // if (isSuccess) {
    //   navigate("/recipes", { replace: true });
    // }
  }, [isSuccess, navigate]);

  return (
    <div className="relative max-w-4xl mx-auto p-4 md:p-8">
      {/* Loading Overlay */}
      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center bg-white/95 px-8 py-4 rounded-lg shadow-xl border border-gray-200">
            <span className="text-xl mr-4 text-gray-800 font-medium">Adding Recipe...</span>
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
        <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Add New Recipe</h2>
        {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
                Error adding recipe: {error.message || "An unknown error occurred."}
            </div>
        )}
        <RecipesForm
            isEdit={false}
            mutateFn={mutate}
            // No default data for adding
            // No delete button needed here
        />
      </div>
    </div>
  );
};

export default AddRecipes;