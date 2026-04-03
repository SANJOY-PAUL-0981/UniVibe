import { NextRequest, NextResponse } from "next/server";
import { ProfileFormSchema } from "@/lib/schemas/profile.schema";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getMainUserTag } from "@/lib/getMainUserData";

const UpdateHobbiesSchema = z.object({
  hobbies: z.array(z.string().trim().min(1)).max(10),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const result = ProfileFormSchema.safeParse(body);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: fieldErrors,
      },
      { status: 422 },
    );
  }

  const userId = session.user.id;

  const existingUsername = await prisma.profile.findUnique({
    where: { username: result.data.username },
  });

  if (existingUsername) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: { username: ["Username is already taken"] },
      },
      { status: 409 },
    );
  }

  try {
    await prisma.profile.create({
      data: {
        username: result.data.username,
        gender: result.data.gender,
        age: result.data.age,
        pronouns: result.data.pronouns,
        college: result.data.college,
        fieldOfStudy: result.data.fieldOfStudy,
        semester: result.data.semester,
        year: result.data.year,
        hobbies: result.data.hobbies ?? [],
        heardFrom: result.data.heardFrom,
        userId: userId,
      },
    });
    revalidateTag(getMainUserTag(userId), "max");
    return NextResponse.json(
      { success: true, message: "Profile created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("DB Error: ", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}


// Hobbies Change Db call(idk it should work)
export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const result = UpdateHobbiesSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const normalizedHobbies = Array.from(
    new Set(result.data.hobbies.map((hobby) => hobby.trim())),
  );

  try {
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: { hobbies: normalizedHobbies },
    });
    revalidateTag(getMainUserTag(session.user.id), "max");

    return NextResponse.json(
      {
        success: true,
        message: "Hobbies updated successfully",
        hobbies: normalizedHobbies,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DB Error: ", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
}
