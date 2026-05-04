"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";

export interface PropertyImage {
  id: string;
  file: File;
  preview: string;
}

interface PropertyImageUploaderProps {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
  maxImages?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function PropertyImageUploader({
  images,
  onChange,
  maxImages = 10,
}: PropertyImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return false;
    }
    return true;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => validateFile(file));
    const availableSlots = maxImages - images.length;
    const filesToAdd = validFiles.slice(0, availableSlots);

    if (filesToAdd.length === 0) return;

    const newImages: PropertyImage[] = filesToAdd.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
    }));

    onChange([...images, ...newImages]);
  }, [images, maxImages, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [processFiles]);

  const handleReplaceSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && replacingId) {
      const file = files[0];
      if (validateFile(file)) {
        const newPreview = URL.createObjectURL(file);
        const oldImage = images.find((img) => img.id === replacingId);
        if (oldImage) {
          URL.revokeObjectURL(oldImage.preview);
        }
        onChange(
          images.map((img) =>
            img.id === replacingId
              ? { ...img, file, preview: newPreview }
              : img
          )
        );
      }
    }
    setReplacingId(null);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
  }, [replacingId, images, onChange]);

  const handleDelete = useCallback((id: string) => {
    const imageToDelete = images.find((img) => img.id === id);
    if (imageToDelete) {
      URL.revokeObjectURL(imageToDelete.preview);
    }
    onChange(images.filter((img) => img.id !== id));
  }, [images, onChange]);

  const handleReplace = (id: string) => {
    setReplacingId(id);
    replaceInputRef.current?.click();
  };

  const triggerUpload = () => {
    if (images.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, []);

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleReplaceSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <div
          onClick={triggerUpload}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${isDragging
              ? "border-black bg-black/[0.04]"
              : "border-black/10 hover:border-black/20 hover:bg-black/[0.02]"
            }
          `}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              transition-all duration-300
              ${isDragging ? "bg-black text-white" : "bg-black/[0.04] text-black"}
            `}>
              <Upload className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-black text-sm font-medium">
                {isDragging ? "Drop images here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-neutral-400 text-xs">
                JPG, PNG, JPEG, WEBP • Max {maxImages}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-black/[0.03] shadow-sm hover:shadow-md transition-all duration-300"
              >
                <img
                  src={image.preview}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => handleReplace(image.id)}
                    className="w-7 h-7 rounded-lg bg-white/95 text-black hover:bg-white shadow-md flex items-center justify-center"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    className="w-7 h-7 rounded-lg bg-white/95 text-red-600 hover:bg-red-50 shadow-md flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium">
                  {index + 1}
                </div>
              </div>
            ))}

            {images.length < maxImages && (
              <button
                type="button"
                onClick={triggerUpload}
                className="aspect-square rounded-lg border-2 border-dashed border-black/10 hover:border-black/20 hover:bg-black/[0.02] transition-all duration-300 flex items-center justify-center text-neutral-400 hover:text-neutral-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-neutral-400 text-xs">
              {images.length}/{maxImages} images uploaded
            </p>
            <button
              type="button"
              onClick={() => {
                images.forEach((img) => URL.revokeObjectURL(img.preview));
                onChange([]);
              }}
              className="text-neutral-500 text-xs hover:text-red-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}