const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads a file to Cloudinary via unsigned upload preset.
 * No API key or secret required — safe to call from the browser.
 * @param {File} file
 * @param {string} folder  Optional Cloudinary folder (default: "rootbridge_profiles")
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = 'rootbridge_profiles') => {
  if (!file) throw new Error('No file provided');

  const formData = new FormData();
  formData.append('file',          file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder',        folder);

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
  const data     = await response.json();

  if (!data.secure_url) {
    console.error('[uploadService] Upload failed:', data);
    throw new Error(data.error?.message || 'Image upload failed');
  }

  return data.secure_url;
};
