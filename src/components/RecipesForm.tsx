import { UseMutateFunction } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

// Define the structure for recipe form input
export type RecipesFormInput = {
  name: string;
  description: string;
  ingredients: string; // Use textarea, so string is fine. Could be string[] if needed later.
  instructions: string; // Use textarea
  prepTime: number; // Preparation time in minutes
  cookTime: number; // Cooking time in minutes
  servings?: number; // Optional number of servings
  imageUrl?: string; // Optional image URL
};

interface RecipesFormProps {
  isEdit: boolean;
  mutateFn: UseMutateFunction<any, Error, RecipesFormInput, unknown>;
  defaultInputData?: RecipesFormInput;
  showDeleteButton?: boolean; // To show delete button on edit/detail pages
  onDelete?: () => void;      // Handler for delete button
}

const RecipesForm: React.FC<RecipesFormProps> = (props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RecipesFormInput>({
    // Optional: Set default values for number inputs if needed
    defaultValues: {
      prepTime: 0,
      cookTime: 0,
      servings: 1,
    }
  });

  useEffect(() => {
    // Populate form with existing data when editing
    if (props.defaultInputData) {
      setValue("name", props.defaultInputData.name);
      setValue("description", props.defaultInputData.description);
      setValue("ingredients", props.defaultInputData.ingredients);
      setValue("instructions", props.defaultInputData.instructions);
      setValue("prepTime", props.defaultInputData.prepTime);
      setValue("cookTime", props.defaultInputData.cookTime);
      setValue("servings", props.defaultInputData.servings);
      setValue("imageUrl", props.defaultInputData.imageUrl);
    }
  }, [props.defaultInputData, setValue]);

  const onSubmit: SubmitHandler<RecipesFormInput> = (data) => {
    // Add confirmation only for edits, not for new recipes
    if (props.isEdit) {
      if (!confirm("Are you sure you want to update this recipe?")) {
        return;
      }
    }
    // Convert times/servings back to numbers just in case they were treated as strings
    const processedData = {
      ...data,
      prepTime: Number(data.prepTime),
      cookTime: Number(data.cookTime),
      servings: data.servings ? Number(data.servings) : undefined,
    };
    props.mutateFn(processedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Recipe Name */}
      <div>
        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
          Recipe Name
        </label>
        <input
          type="text"
          id="name"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.name ? "border-red-500" : ""
          }`}
          placeholder="e.g., Spicy Chicken Curry"
          {...register("name", { required: "Recipe name is required." })}
        />
        {errors.name && (
          <p className="text-red-600 text-xs italic mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">
          Description
        </label>
        <textarea
          id="description"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.description ? "border-red-500" : ""
          }`}
          rows={3}
          placeholder="A brief description of the dish"
          {...register("description", { required: "Description is required." })}
        ></textarea>
        {errors.description && (
          <p className="text-red-600 text-xs italic mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Ingredients */}
      <div>
        <label htmlFor="ingredients" className="block text-gray-700 font-bold mb-2">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.ingredients ? "border-red-500" : ""
          }`}
          rows={5}
          placeholder="List ingredients, one per line (e.g., 1 cup flour, 2 eggs)"
          {...register("ingredients", { required: "Ingredients are required." })}
        ></textarea>
        {errors.ingredients && (
          <p className="text-red-600 text-xs italic mt-1">{errors.ingredients.message}</p>
        )}
      </div>

      {/* Instructions */}
      <div>
        <label htmlFor="instructions" className="block text-gray-700 font-bold mb-2">
          Instructions
        </label>
        <textarea
          id="instructions"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.instructions ? "border-red-500" : ""
          }`}
          rows={8}
          placeholder="Step-by-step cooking instructions"
          {...register("instructions", { required: "Instructions are required." })}
        ></textarea>
        {errors.instructions && (
          <p className="text-red-600 text-xs italic mt-1">{errors.instructions.message}</p>
        )}
      </div>

      {/* Prep Time, Cook Time, Servings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="prepTime" className="block text-gray-700 font-bold mb-2">
            Prep Time (min)
          </label>
          <input
            type="number"
            id="prepTime"
            min="0"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.prepTime ? "border-red-500" : ""
            }`}
            placeholder="e.g., 15"
            {...register("prepTime", {
              required: "Prep time is required.",
              valueAsNumber: true,
              min: { value: 0, message: "Time cannot be negative." },
            })}
          />
          {errors.prepTime && (
            <p className="text-red-600 text-xs italic mt-1">{errors.prepTime.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="cookTime" className="block text-gray-700 font-bold mb-2">
            Cook Time (min)
          </label>
          <input
            type="number"
            id="cookTime"
            min="0"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.cookTime ? "border-red-500" : ""
            }`}
            placeholder="e.g., 30"
            {...register("cookTime", {
              required: "Cook time is required.",
              valueAsNumber: true,
              min: { value: 0, message: "Time cannot be negative." },
            })}
          />
          {errors.cookTime && (
            <p className="text-red-600 text-xs italic mt-1">{errors.cookTime.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="servings" className="block text-gray-700 font-bold mb-2">
            Servings (optional)
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              errors.servings ? "border-red-500" : ""
            }`}
            placeholder="e.g., 4"
            {...register("servings", {
                valueAsNumber: true,
                min: { value: 1, message: "Servings must be at least 1." },
                validate: value => !value || !isNaN(value) || 'Must be a number' // Allow empty or number
            })}
          />
          {errors.servings && (
            <p className="text-red-600 text-xs italic mt-1">{errors.servings.message}</p>
          )}
        </div>
      </div>

      {/* Image URL (Optional) */}
      <div>
        <label htmlFor="imageUrl" className="block text-gray-700 font-bold mb-2">
          Image URL (optional)
        </label>
        <input
          type="url"
          id="imageUrl"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.imageUrl ? "border-red-500" : ""
          }`}
          placeholder="https://example.com/image.jpg"
          {...register("imageUrl", {
             pattern: {
               value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/,
               message: "Please enter a valid image URL (http/https)."
             }
          })}
        />
         {errors.imageUrl && (
          <p className="text-red-600 text-xs italic mt-1">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Buttons: Save and Optional Delete */}
      <div className="flex justify-end items-center mt-8 space-x-4">
        {props.showDeleteButton && props.onDelete && (
          <button
            type="button"
            onClick={props.onDelete}
            className="py-2 px-5 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 flex items-center transition duration-150 ease-in-out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        )}
        <button
          type="submit"
          className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 flex items-center transition duration-150 ease-in-out"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 3.293a1 1 0 011.414 1.414l-10 10a1 1 0 01-.293.207l-4 2a1 1 0 01-1.32-1.32l2-4a1 1 0 01.207-.293l10-10zM16 5l-1.5 1.5-2-2L14 3l2 2zM5 14l-1.5 1.5-2-2L3 12l2 2z" /> {/* Adjusted Save Icon */}
           </svg>
          Save Recipe
        </button>
      </div>
    </form>
  );
};

export default RecipesForm;