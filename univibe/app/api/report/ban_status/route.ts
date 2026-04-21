import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user?.id) {
            return NextResponse.json({
                message: "Unauthorized",
                code: 401

            });
        }

        const userId = session?.user.id

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true }
        })

        if (!user) {
            return NextResponse.json({
                message: "User not found",
                code: 404
            },);
        }

        const profileId = user?.profile?.id
        if (!profileId) {
            return NextResponse.json({
                message: "No ProfileId found",
                code: 404
            })
        }

        let isBanned = user.profile?.isBanned

        if (user.profile?.isBanned && user.profile.bannedAt) {
            const bannedTime = new Date(user.profile.bannedAt).getTime()
            const now = Date.now()

            const diff = now - bannedTime

            if (diff > 48 * 60 * 60 * 1000) {
                await prisma.profile.update({
                    where: { id: profileId },
                    data: {
                        isBanned: false,
                        bannedAt: null,
                        reportCount: 0
                    }
                })
                isBanned: false
            }
        }

        return NextResponse.json({
            isBanned
        })
    } catch (err) {
        console.error("Error from ban_status: ", err)
        return NextResponse.json({
            message: "Internal Serve Error!",
            success: false,
            code: 500
        })
    }
}