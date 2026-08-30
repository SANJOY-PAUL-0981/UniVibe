import { z } from "zod";

const PersonalDetails = z.object({
  username: z
    .string()
    .min(3, { message: "Username should be atleast 5 characters" })
    .max(20, { message: "Username should not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),

  gender: z.enum(["male", "female", "prefer_not_to_say"] as const, {
    error: "Please select a valid gender option",
  }),

  age: z
    .number({ error: "Age must be a number" })
    .int({ message: "Age must be a whole number" })
    .min(18, { message: "Age must be above 18" })
    .max(100, { message: "Enter a valid age" }),

  pronouns: z
    .string()
    .max(20)
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
});

const EducationalDetails = z.object({
  college: z
    .string({ error: "College name must be a string." })
    .min(3, { message: "College name too short" })
    .max(300),

  fieldOfStudy: z
    .string()
    .min(2, { message: "Field of study too short" })
    .max(100),

  semester: z
    .number({ error: "Semester must be a number" })
    .int()
    .min(1, { message: "Semester must be between 1-8" })
    .max(8, { message: "Semester must be between 1-8" }),

  year: z
    .number({ error: "Year must be a number" })
    .int()
    .min(1, { message: "Year must be a between 1-4" })
    .max(4, { message: "Year must be between 1-4" }),
});

const Miscellaneous = z.object({
  hobbies: z.array(z.string().min(1)).max(10).optional(),
  heardFrom: z.string().min(3).max(100),
});

export const ProfileFormSchema =
  PersonalDetails.merge(EducationalDetails).merge(Miscellaneous);

export type ProfileFormData = z.infer<typeof ProfileFormSchema>; // Auto-generate the TypeScript type from the schema
