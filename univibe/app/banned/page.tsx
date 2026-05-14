import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const BannedPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    include: {
      profile: true,
    },
  });

  if (!user?.profile?.isBanned) {
    redirect("/home");
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center text-center">
      <div className="flex flex-col items-center gap-5">
        <Image
          src="/scuba-cat-banned.gif"
          alt="403 scuba cat"
          width={200}
          height={200}
        />

        <p className="font-bold text-5xl">403</p>

        <div className="text-xs font-semibold text-muted-foreground">
          <p>Univibe said: nah, not today</p>
          <p>You speedran getting banned. New record? 🏆</p>
          <p>We've seen bots behave better than you.</p>
          <p>Take 48 hours off. The app needs a break from you.</p>
        </div>

        <div className="flex gap-5">
          <Link href="/" className="btn text-sm font-bold">
            Back To Home!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BannedPage;