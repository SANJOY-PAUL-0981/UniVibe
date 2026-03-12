import { NextRequest, NextResponse } from "next/server";
import { ProfileFormSchema } from "@/lib/schemas/profile.schema";

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

  console.log("Valid data received:", result.data);

  return NextResponse.json(
    { success: true, message: "Profile created successfully" },
    { status: 201 },
  );
}
