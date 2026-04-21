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

        const activeCall = await prisma.callSession.findFirst({
            where: {
                OR: [
                    { profile1Id: profileId },
                    { profile2Id: profileId }
                ]
            }
        })

        if (!activeCall) {
            return NextResponse.json({
                message: "No Active Call found",
                code: 404
            })
        }

        const reportedProfileId =
            activeCall.profile1Id === profileId
                ? activeCall.profile2Id
                : activeCall.profile1Id

        const updateProfile = await prisma.profile.update({
            where: { id: reportedProfileId },
            data: {
                reportCount: { increment: 1 }
            }
        })

        if (updateProfile.reportCount >= 10) {
            await prisma.profile.update({
                where: { id: reportedProfileId },
                data: {
                    isBanned: true,
                    reportCount: 0,
                    bannedAt: new Date()
                }
            })
        }

        return NextResponse.json({
            message: "User Reported Successfully",
            success: true,
            code: 200
        })
    } catch (err) {
        console.error("Error from report: ", err)
        return NextResponse.json({
            message: "Internal Serve Error!",
            success: false,
            code: 500
        })
    }
}