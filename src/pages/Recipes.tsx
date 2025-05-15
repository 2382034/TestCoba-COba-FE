import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define the structure of a recipe object fetched from the API
type RecipeType = {
  id: number; // Ensure ID is present
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  imageUrl?: string; // Optional image
  // Add other fields if they are returned by the list endpoint and needed for the card
};

// Async function to fetch the list of recipes
const fetchRecipeList = async (token: string | null) => {
  if (!token) throw new Error("Authentication token is missing");
  // Adjust API endpoint
  return await axios.get<RecipeType[]>("/api/recipes", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Component for displaying a single recipe card
const RecipeCard = ({ id, name, description, prepTime, cookTime, imageUrl, onViewClick }: RecipeType & { onViewClick: (id: number) => void }) => {
  const totalTime = prepTime + cookTime;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-5 hover:shadow-lg transition-shadow duration-200 flex flex-col sm:flex-row items-start gap-4 border border-gray-100">
      {imageUrl && (
        <img
            src={imageUrl}
            alt={name}
            className="w-full sm:w-32 h-32 object-cover rounded flex-shrink-0"
            onError={(e) => (e.currentTarget.style.display = 'none')} // Hide if image fails to load
        />
      )}
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-1 text-gray-800">{name || "Untitled Recipe"}</h2>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{description || "No description available."}</p>
         <div className="text-xs text-gray-500 mb-3">
            <span>Prep: {prepTime} min</span> | <span>Cook: {cookTime} min</span> | <span>Total: {totalTime} min</span>
        </div>
      </div>
      <button
        onClick={() => onViewClick(id)} // Use the passed function
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out self-end sm:self-center mt-2 sm:mt-0"
      >
        View Details
      </button>
    </div>
  );
};


const Recipes = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recipeList"], // Unique query key for recipes
    queryFn: () => fetchRecipeList(getToken())
    // Add other react-query options if needed (e.g., staleTime, refetchOnWindowFocus)
  });

  // Loading State
  if (isLoading) {
    return <div className="p-6 text-center text-gray-600">Loading recipes...</div>;
  }

  // Error State
  if (isError) {
    return <div className="p-6 text-center text-red-600">Failed to load recipes: {error?.message || 'Unknown error'}</div>;
  }

  // Get recipes data or default to empty array
  const recipes = data?.data || [];

  // Filter recipes based on search term (name or description)
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to Add Recipe page
  const handleAddRecipe = () => {
    navigate("/add-recipe"); // Adjust route as needed
  };

  // Navigate to Recipe Detail page
  const handleViewRecipe = (id: number) => {
    navigate(`/recipes/${id}`); // Adjust route as needed
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header: Add Button and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={handleAddRecipe}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md flex items-center font-medium shadow-sm transition duration-150 ease-in-out w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Recipe
        </button>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search Recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l1.293-1.293 1.293 1.293a1 1 0 101.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Recipe List or No Results Message */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg mb-2">
             {searchTerm ? "No recipes found matching your search." : "No recipes added yet."}
          </p>
          {!searchTerm && (
             <p>Click "Add Recipe" to get started!</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              description={recipe.description}
              prepTime={recipe.prepTime}
              cookTime={recipe.cookTime}
              imageUrl={recipe.imageUrl}
              onViewClick={handleViewRecipe} // Pass the handler function
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recipes;