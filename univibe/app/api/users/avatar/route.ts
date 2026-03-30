import { auth } from "@/lib/auth";
import { deleteAvatarByUrl, uploadAvatar } from "@/lib/cloudinary";
import { getMainUserTag } from "@/lib/getMainUserData";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, message: "Image file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ success: false, message: "Only image uploads are allowed" }, { status: 415 });
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, message: "Image must be 5MB or smaller" },
      { status: 413 }
    );
  }

  try {
    const imageUrl = await uploadAvatar(file, session.user.id);

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { profilePicture: imageUrl },
    });

    revalidateTag(getMainUserTag(session.user.id), { expire: 0 });

    return NextResponse.json({ success: true, imageUrl }, { status: 200 });
  } catch (error) {
    console.error("Avatar upload failed", error);
    return NextResponse.json({ success: false, message: "Failed to upload avatar" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { profilePicture: true },
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: "Profile not found" }, { status: 404 });
    }

    if (profile.profilePicture) {
      await deleteAvatarByUrl(profile.profilePicture);
    }

    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { profilePicture: null },
    });

    revalidateTag(getMainUserTag(session.user.id), { expire: 0 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Avatar delete failed", error);
    return NextResponse.json({ success: false, message: "Failed to delete avatar" }, { status: 500 });
  }
}
