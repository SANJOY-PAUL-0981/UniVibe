import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const AuthCallbackPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/auth/login")
    }

    const profile = await prisma.profile.findUnique({
        where: {
            userId: session.user.id
        },
        select: { id: true }
    })

    redirect(profile ? "/home" : "/user-details")
}

export default AuthCallbackPage;