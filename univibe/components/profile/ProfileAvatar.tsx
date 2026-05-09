"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  selectProfileStoreProfilePicture,
  useProfileStore,
} from "@/store/useProfileStore";

type Props = {
  initials: string;
  imageUrl?: string | null;
};

export function ProfileAvatar({ initials, imageUrl }: Props) {
  const storeImageUrl = useProfileStore(selectProfileStoreProfilePicture);
  const updateProfilePartial = useProfileStore((state) => state.updateProfilePartial);
  const [preview, setPreview] = useState<string | null>(storeImageUrl ?? imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isBusy = uploading || deleting;

  useEffect(() => {
    if (isBusy) {
      return;
    }

    setPreview(storeImageUrl ?? null);
  }, [storeImageUrl, imageUrl, isBusy]);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previousPreview = preview;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/users/avatar", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.success === false || !data.imageUrl) {
        throw new Error(data.message ?? "Failed to upload avatar");
      }

      URL.revokeObjectURL(localUrl);
      setPreview(data.imageUrl);
      updateProfilePartial({ profilePicture: data.imageUrl });
      toast.success("Profile photo updated");
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      setPreview(previousPreview);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const deleteAvatar = async () => {
    if (isBusy || !preview) return;

    const previousPreview = preview;
    setDeleting(true);

    try {
      const res = await fetch("/api/users/avatar", {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.message ?? "Failed to delete avatar");
      }

      setPreview(null);
      updateProfilePartial({ profilePicture: null });
      toast.success("Profile photo removed");
    } catch (error) {
      setPreview(previousPreview);
      toast.error(error instanceof Error ? error.message : "Failed to delete avatar");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="group relative h-24 w-24 cursor-pointer"
      onClick={() => {
        if (!isBusy) {
          inputRef.current?.click();
        }
      }}
    >

      {/* Avatar circle */}
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-chart-4 text-2xl font-bold text-white ring-4 ring-border">
        {preview
          ? <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
          : initials
        }
      </div>

      {/* Upload overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        {isBusy ? (
          <span className="text-xs font-medium text-white animate-pulse">{uploading ? "Uploading..." : "Deleting..."}</span>
        ) : (
          <Camera className="h-6 w-6 text-white" />
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void deleteAvatar();
          }}
          disabled={isBusy}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:text-destructive"
          aria-label="Remove profile photo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={isBusy}
      />
    </div>
  );
}