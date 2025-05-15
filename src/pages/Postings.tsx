import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../utils/AuthProvider";
import axios from "../utils/AxiosInstance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define the structure of a posting object fetched from the list API
type PostingType = {
  id: number;
  title: string;
  content: string; // Assuming full content or a snippet is returned
  imageUrl?: string; // Optional image
  // Add other fields if returned and needed for the card (e.g., createdAt)
};

// Async function to fetch the list of postings
// Assuming the API returns an array of PostingType directly or nested under 'data'
const fetchPostingList = async (token: string | null) => {
  if (!token) throw new Error("Authentication token is missing");
  // Adjust API endpoint and expected response structure if needed
  // e.g., if data is nested: return await axios.get<{ data: PostingType[] }>(...)
  return await axios.get<PostingType[]>("/api/postings", { // Changed endpoint
    headers: { Authorization: `Bearer ${token}` }
  });
};

// --- Posting Card Component ---
interface PostingCardProps extends PostingType {
    onViewClick: (id: number) => void;
}

const PostingCard: React.FC<PostingCardProps> = ({ id, title, content, imageUrl, onViewClick }) => {
  // Simple truncation for content preview
  const contentSnippet = content.length > 150 ? content.substring(0, 147) + "..." : content;

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-5 hover:shadow-lg transition-shadow duration-200 flex flex-col sm:flex-row items-start gap-4 border border-gray-100">
      {imageUrl && (
        <img
            src={imageUrl}
            alt={title}
            className="w-full sm:w-32 h-32 object-cover rounded flex-shrink-0 bg-gray-100" // Added bg color
            onError={(e) => { // More robust error handling
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Optionally show a placeholder
                // target.parentElement?.insertAdjacentHTML('afterbegin', '<div class="w-full sm:w-32 h-32 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Image</div>');
            }}
        />
      )}
      <div className="flex-grow">
        <h2 className="text-xl font-semibold mb-1 text-gray-800">{title || "Untitled Posting"}</h2>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{contentSnippet || "No content available."}</p>
      </div>
      <button
        onClick={() => onViewClick(id)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-medium transition duration-150 ease-in-out self-end sm:self-center mt-2 sm:mt-0 flex-shrink-0" // Added flex-shrink-0
      >
        View Details
      </button>
    </div>
  );
};


// --- Postings List Page Component ---
const Postings = () => {
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: postingsResponse, isLoading, isError, error } = useQuery({
    queryKey: ["postingList"], // Unique query key for postings
    queryFn: () => fetchPostingList(getToken()),
    // Consider staleTime/cacheTime
    // staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Loading State
  if (isLoading) {
    return (
        <div className="p-6 text-center text-gray-600 flex justify-center items-center min-h-[200px]">
            <svg className="animate-spin h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading postings...
        </div>
    );
  }

  // Error State
  if (isError) {
    return <div className="p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-md max-w-2xl mx-auto">
        Failed to load postings: {(error as Error)?.message || 'Unknown error'}
    </div>;
  }

  // Get postings data (adjust '.data' if your API structure differs)
  const postings = postingsResponse?.data || [];

  // Filter postings based on search term (title or content)
  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    posting.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Navigate to Add Posting page
  const handleAddPosting = () => {
    navigate("/add-posting"); // Adjusted route
  };

  // Navigate to Posting Detail page
  const handleViewPosting = (id: number) => {
    navigate(`/postings/${id}`); // Adjusted route
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header: Add Button and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={handleAddPosting}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-md flex items-center font-medium shadow-sm transition duration-150 ease-in-out w-full sm:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Posting {/* Changed text */}
        </button>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search Postings..." // Changed text
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

      {/* Posting List or No Results Message */}
      {filteredPostings.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-lg mb-2 font-semibold">
             {searchTerm ? "No postings found matching your search." : "No postings added yet."}
          </p>
          {!searchTerm && (
             <p>Click "Add Posting" to create your first one!</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPostings.map((posting) => (
            <PostingCard
              key={posting.id}
              id={posting.id}
              title={posting.title}
              content={posting.content}
              imageUrl={posting.imageUrl}
              onViewClick={handleViewPosting} // Pass the handler function
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Postings;