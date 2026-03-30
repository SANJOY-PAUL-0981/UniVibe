"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

type Props = {
  initials: string;
  imageUrl?: string | null;
};

export function ProfileAvatar({ initials, imageUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(imageUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    // TODO: upload to storage (S3/Cloudinary etc.) and PATCH /api/users
  };

  return (
    <div className="group relative h-24 w-24 cursor-pointer" onClick={() => inputRef.current?.click()}>

      {/* Avatar circle */}
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-chart-4 text-2xl font-bold text-white ring-4 ring-border">
        {preview
          ? <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
          : initials
        }
      </div>

      {/* Upload overlay on hover */}
      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Camera className="h-6 w-6 text-white" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}