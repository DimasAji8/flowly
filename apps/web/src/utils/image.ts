/**
 * Utility to compress images on the client side using HTML Canvas.
 * This helps to prevent payload size errors on the backend (e.g., NestJS 4MB limit).
 */
export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<File> {
  // If the file is not an image, return it as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // If the file size is already small (e.g., < 1.5MB), we can keep it as is,
  // but running it through compressor ensures metadata removal and consistent format.
  // We'll run it through compression if it exceeds 1.5MB.
  if (file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(file); // Fallback to original file if canvas context is not available
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas back to Blob, then to File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file); // Fallback to original file
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => {
        resolve(file); // Fallback to original file
      };
    };
    reader.onerror = () => {
      resolve(file); // Fallback to original file
    };
  });
}
