import { NextRequest, NextResponse } from "next/server";
import { ProfileFormSchema } from "@/lib/schemas/profile.schema";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const profile = await prisma.profile.create({
      data: {
        username: result.data.username,
        gender: result.data.gender,
        age: result.data.age,
        pronouns: result.data.pronouns,
        university: result.data.university,
        college: result.data.college,
        fieldOfStudy: result.data.fieldOfStudy,
        semester: result.data.semester,
        hobbies: result.data.hobbies ?? [],
        heardFrom: result.data.heardFrom,
        userId: userId,
      },
    });
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
