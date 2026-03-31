import "server-only";

import { v2 as cloudinary } from "cloudinary";

let isCloudinaryConfigured = false;

const ensureCloudinaryConfig = () => {
  if (isCloudinaryConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are missing");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isCloudinaryConfigured = true;
};

export async function uploadAvatar(file: File, userId: string): Promise<string> {
  ensureCloudinaryConfig();

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "univibe/avatars",
    public_id: `${userId}-${Date.now()}`,
    resource_type: "image",
    overwrite: true,
    transformation: [
      { width: 320, height: 320, crop: "fill", gravity: "face" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return result.secure_url;
}

export async function deleteAvatarByUrl(imageUrl: string): Promise<void> {
  ensureCloudinaryConfig();

  try {
    const parsed = new URL(imageUrl);
    if (!parsed.hostname.includes("cloudinary.com")) {
      return;
    }

    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = pathSegments.findIndex((segment) => segment === "upload");
    if (uploadIndex === -1) {
      return;
    }

    let publicIdSegments = pathSegments.slice(uploadIndex + 1);

    if (publicIdSegments[0]?.startsWith("v")) {
      publicIdSegments = publicIdSegments.slice(1);
    }

    if (publicIdSegments.length === 0) {
      return;
    }

    const lastSegment = publicIdSegments[publicIdSegments.length - 1] ?? "";
    publicIdSegments[publicIdSegments.length - 1] = lastSegment.replace(/\.[^/.]+$/, "");
    const publicId = publicIdSegments.join("/");

    if (!publicId) {
      return;
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch {
    return;
  }
}
