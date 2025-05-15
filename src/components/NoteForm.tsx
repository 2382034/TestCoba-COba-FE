import { UseMutateFunction } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

interface NoteFormProps {
  isEdit: boolean;
  mutateFn: UseMutateFunction<any, Error, NoteFormInput, unknown>;
  defaultInputData?: NoteFormInput;
  showDeleteButton?: boolean;
  onDelete?: () => void;
}

export type NoteFormInput = {
  title: string;
  content: string;
};

const NoteForm: React.FC<NoteFormProps> = (props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<NoteFormInput>();

  useEffect(() => {
    if (props.defaultInputData) {
      setValue("title", props.defaultInputData.title);
      setValue("content", props.defaultInputData.content);
    }
  }, [props.defaultInputData, setValue]);

  const onSubmit: SubmitHandler<NoteFormInput> = (data) => {
    if (props.isEdit) {
      if (!confirm("Are you sure you want to update this note?")) {
        return;
      }
    }
    props.mutateFn(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">
          Title
        </label>
        <input
          type="text"
          id="title"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.title ? "border-red-500" : ""
          }`}
          placeholder="Title"
          {...register("title", { required: true })}
        />
        {errors.title && (
          <p className="text-red-600 text-xs italic mt-1">Title is required.</p>
        )}
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-gray-700 font-bold mb-2">
          Content
        </label>
        <textarea
          id="content"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.content ? "border-red-500" : ""
          }`}
          rows={4}
          placeholder="Content"
          {...register("content", { required: true })}
        ></textarea>
        {errors.content && (
          <p className="text-red-600 text-xs italic mt-1">Content is required.</p>
        )}
      </div>

      {/* Buttons */}
<div className="flex justify-end items-center mt-6 space-x-3">
  {props.showDeleteButton && props.onDelete && (
    <button
      type="button"
      onClick={props.onDelete}
      className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      Delete
    </button>
  )}
  <button
    type="submit"
    className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 3.293a1 1 0 011.414 1.414l-10 10a1 1 0 01-.293.207l-4 2a1 1 0 01-1.32-1.32l2-4a1 1 0 01.207-.293l10-10z" />
    </svg>
    Save
  </button>
</div>
    </form>
  );
};

export default NoteForm;