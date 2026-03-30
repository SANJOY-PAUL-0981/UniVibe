import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

const MAIN_USER_CACHE_KEY = "main-user-data";
const MAIN_USER_CACHE_TTL_SECONDS = 60;

export const getMainUserTag = (userId: string) => `main-user:${userId}`;

const readMainUser = (userId: string) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          username: true,
          gender: true,
          age: true,
          pronouns: true,
          university: true,
          college: true,
          fieldOfStudy: true,
          semester: true,
          hobbies: true,
        },
      },
    },
  });

type RawMainUserData = Awaited<ReturnType<typeof readMainUser>>;
type MainUserData = Omit<NonNullable<RawMainUserData>, "profile"> & {
  profile: NonNullable<NonNullable<RawMainUserData>["profile"]>;
};

const getCachedMainUserById = (userId: string) =>
  unstable_cache(
    async () => readMainUser(userId),
    [MAIN_USER_CACHE_KEY, userId],
    {
      revalidate: MAIN_USER_CACHE_TTL_SECONDS,
      tags: [getMainUserTag(userId)],
    }
  )();

export async function getMainUserData(): Promise<MainUserData> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const user = await getCachedMainUserById(session.user.id);

  if (!user) redirect("/auth/login");
  if (!user.profile) redirect("/user-details");

  return user as MainUserData;
}