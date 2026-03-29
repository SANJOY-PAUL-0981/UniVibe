"use server"
import { prisma } from "@/lib/prisma"

export const getProfileAction = async (userId: string) => {
    const profile = await prisma.profile.findUnique({
        where: { userId }
    })
    return profile
}