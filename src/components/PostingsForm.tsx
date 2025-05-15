import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { UseMutateFunction } from '@tanstack/react-query'; // Import UseMutateFunction

// Define the shape of the form data
export type PostingsFormInput = {
  title: string;
  content: string;
  imageUrl?: string; // Optional image URL
};

// Define the props for the PostingsForm component
interface PostingsFormProps {
  isEdit: boolean; // Are we editing or adding?
  mutateFn: UseMutateFunction<any, Error, PostingsFormInput, unknown>; // Function to call on submit
  defaultInputData?: PostingsFormInput; // Initial data for editing
  showDeleteButton?: boolean; // Should the delete button be shown?
  onDelete?: () => void; // Function to call when delete is clicked
  isMutating?: boolean; // Is a mutation (save/delete) in progress?
}

const PostingsForm: React.FC<PostingsFormProps> = ({
  isEdit,
  mutateFn,
  defaultInputData,
  showDeleteButton = false,
  onDelete,
  isMutating = false, // Default to false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // isSubmitting from react-hook-form
    reset,
  } = useForm<PostingsFormInput>({
    defaultValues: defaultInputData || { title: '', content: '', imageUrl: '' },
  });

  // Reset form if default data changes (e.g., after loading in edit mode)
  React.useEffect(() => {
    if (defaultInputData) {
      reset(defaultInputData);
    }
  }, [defaultInputData, reset]);

  const onSubmit: SubmitHandler<PostingsFormInput> = (data) => {
    // Filter out empty imageUrl if needed, or handle on backend
    const submissionData = {
        ...data,
        imageUrl: data.imageUrl?.trim() === '' ? undefined : data.imageUrl,
    };
    mutateFn(submissionData);
  };

  // Combined loading state: form submission or external mutation (like delete)
  const isLoading = isSubmitting || isMutating;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.title
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          }`}
          disabled={isLoading}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        <textarea
          id="content"
          rows={6}
          {...register('content', { required: 'Content is required' })}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 resize-vertical ${
            errors.content
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-indigo-500'
          }`}
          disabled={isLoading}
        />
        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content.message}</p>}
      </div>

      {/* Image URL Field (Optional) */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (Optional)
        </label>
        <input
          id="imageUrl"
          type="url"
          {...register('imageUrl')}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            errors.imageUrl
              ? 'border-red-500 focus:ring-red-500' // Basic URL validation can be added if needed
              : 'border-gray-300 focus:ring-indigo-500'
          }`}
          placeholder="https://example.com/image.jpg"
          disabled={isLoading}
        />
        {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl.message}</p>}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center"
          disabled={isLoading}
        >
           {isLoading && !isMutating ? ( // Show spinner only for form submission
             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
           ) : null}
           {isEdit ? 'Save Changes' : 'Add Posting'}
        </button>

        {isEdit && showDeleteButton && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out disabled:opacity-50"
            disabled={isLoading} // Disable delete if any mutation is happening
          >
            Delete Posting
          </button>
        )}
      </div>
    </form>
  );
};

export default PostingsForm;