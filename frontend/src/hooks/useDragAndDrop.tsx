import { useState, useCallback, DragEvent } from "react";

interface UseDragAndDropOptions {
  onFileDrop: (file: File) => void;
  acceptedFormats?: string[];
  maxSizeMB?: number;
  onError?: (error: string) => void;
}

export const useDragAndDrop = ({
  onFileDrop,
  acceptedFormats = [".csv", ".xlsx", ".xls", ".json", ".pdf"],
  maxSizeMB = 5,
  onError,
}: UseDragAndDropOptions) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return {
          valid: false,
          error: `File size exceeds ${maxSizeMB}MB limit`,
        };
      }

      // Check file format
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidFormat = acceptedFormats.some((format) =>
        fileExtension.includes(format.toLowerCase().replace(".", ""))
      );

      if (!isValidFormat) {
        return {
          valid: false,
          error: `Invalid file format. Accepted formats: ${acceptedFormats.join(", ")}`,
        };
      }

      return { valid: true };
    },
    [acceptedFormats, maxSizeMB]
  );

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragging to false if leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) {
        onError?.("No files detected");
        return;
      }

      if (files.length > 1) {
        onError?.("Please upload one file at a time");
        return;
      }

      const file = files[0];
      const validation = validateFile(file);

      if (!validation.valid) {
        onError?.(validation.error || "Invalid file");
        return;
      }

      onFileDrop(file);
    },
    [onFileDrop, onError, validateFile]
  );

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
  };
};
