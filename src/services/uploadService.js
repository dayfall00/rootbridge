const CLOUD_NAME = "dhau8ongg";
const UPLOAD_PRESET = "rootbridge_upload";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads a file to Cloudinary via unsigned upload preset.
 * No API key or secret required — safe to call from the browser.
 * @param {File} file
 * @returns {Promise<string>} secure_url of the uploaded image
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log("Cloudinary response:", data);

  if (!data.secure_url) {
    console.error("Upload failed:", data);
    throw new Error(data.error?.message || "Image upload failed");
  }

  return data.secure_url;
};
