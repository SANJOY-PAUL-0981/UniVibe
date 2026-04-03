import { prisma } from "../lib/prisma.js";

export const makeActive = async (profileId: string, socketId: string, filters: {
    filterByGender?: boolean,
    filterGenderData?: string
    filterByCollege?: boolean,
    filterCollegeData?: string
    filterByFieldOfStudy?: boolean,
    filterFieldOfStudyData?: string,
    filterByYear?: boolean,
    filterYearData?: number
    currentDomain?: number
}) => {
    const alreadyWaiting = await prisma.waitingUser.findUnique({
        where: { profileId }
    })

    if (alreadyWaiting) {
        return {
            error: "Already in Waiting Queue!"
        }
    }

    const alreadyInCall = await prisma.callSession.findFirst({
        where: {
            OR: [
                { profile1Id: profileId },
                { profile2Id: profileId }
            ]
        }
    })

    if (alreadyInCall) {
        return {
            error: "Already In a Call!"
        }
    }

    const waitingUser = await prisma.waitingUser.create({
        data: {
            profileId,
            socketId,
            filterByCollege: filters.filterByCollege ?? false,
            filterCollegeData: filters.filterCollegeData,
            filterByFieldOfStudy: filters.filterByFieldOfStudy ?? false,
            filterFieldOfStudyData: filters.filterFieldOfStudyData,
            filterByGender: filters.filterByGender ?? false,
            filterGenderData: filters.filterGenderData,
            filterByYear: filters.filterByYear ?? false,
            filterYearData: filters.filterYearData,
            currentDomain: filters.currentDomain ?? 3 // 3 means random
        }
    })

    return {
        success: true,
        waitingUser
    }
}

export const randomMatch = async (profileId: string) => {
    const match = await prisma.waitingUser.findFirst({
        where: {
            filterByCollege: false,
            filterByFieldOfStudy: false,
            filterByGender: false,
            filterByYear: false,
            NOT: { profileId }
        },
        orderBy: {
            createdAt: "asc"
        }
    })

    if (!match) {
        return null
    }

    const initiatorData = await prisma.waitingUser.findUnique({
        where: { profileId }
    })

    if (!initiatorData) {
        return null
    }

    const session = await prisma.callSession.create({
        data: {
            profile1Id: profileId,
            profile2Id: match.profileId,

            p1CurrentDomain: initiatorData.currentDomain,

            p1FilterByCollege: initiatorData.filterByCollege,
            p1FilterCollegeData: initiatorData.filterCollegeData,
            p1FilterByFieldOfStudy: initiatorData.filterByFieldOfStudy,
            p1FilterFieldOfStudyData: initiatorData.filterFieldOfStudyData,
            p1FilterByGender: initiatorData.filterByGender,
            p1FilterGenderData: initiatorData.filterGenderData,
            p1FilterByYear: initiatorData.filterByYear,
            p1FilterYearData: initiatorData.filterYearData,

            p2CurrentDomain: match.currentDomain,

            p2FilterByCollege: match.filterByCollege,
            p2FilterCollegeData: match.filterCollegeData,
            p2FilterByFieldOfStudy: match.filterByFieldOfStudy,
            p2FilterFieldOfStudyData: match.filterFieldOfStudyData,
            p2FilterByGender: match.filterByGender,
            p2FilterGenderData: match.filterGenderData,
            p2FilterByYear: match.filterByYear,
            p2FilterYearData: match.filterYearData
        }
    })

    await prisma.waitingUser.deleteMany({
        where: {
            profileId: { in: [profileId, match.profileId] }
        }
    })

    return {
        success: true,
        session
    }
}

export const endSession = async (roomId: string) => {
    const session = await prisma.callSession.findUnique({
        where: { roomId }
    })

    if (!session) {
        return null
    }

    await prisma.callSession.delete({
        where: { roomId }
    })

    return {
        profile1Id: session.profile1Id,
        profile2Id: session.profile2Id,
        p1Prefs: {
            filterByGender: session.p1FilterByGender,
            filterGenderData: session.p1FilterGenderData,
            filterByCollege: session.p1FilterByCollege,
            filterCollegeData: session.p1FilterCollegeData,
            filterByFieldOfStudy: session.p1FilterByFieldOfStudy,
            filterFieldOfStudyData: session.p1FilterFieldOfStudyData,
            filterByYear: session.p1FilterByYear,
            filterYearData: session.p1FilterYearData,
            currentDomain: session.p1CurrentDomain
        },
        p2Prefs: {
            filterByGender: session.p2FilterByGender,
            filterGenderData: session.p2FilterGenderData,
            filterByCollege: session.p2FilterByCollege,
            filterCollegeData: session.p2FilterCollegeData,
            filterByFieldOfStudy: session.p2FilterByFieldOfStudy,
            filterFieldOfStudyData: session.p2FilterFieldOfStudyData,
            filterByYear: session.p2FilterByYear,
            filterYearData: session.p2FilterYearData,
            currentDomain: session.p2CurrentDomain
        }
    }
}

export const requeueBoth = async (
    profile1Id: string,
    profile2Id: string,
    p1SocketId: string,
    p2SocketId: string,
    p1Prefs: {
        filterByGender: boolean,
        filterGenderData: string | null,
        filterByCollege: boolean,
        filterCollegeData: string | null,
        filterByFieldOfStudy: boolean,
        filterFieldOfStudyData: string | null,
        filterByYear: boolean,
        filterYearData: number | null,
        currentDomain: number
    },
    p2Prefs: {
        filterByGender: boolean,
        filterGenderData: string | null,
        filterByCollege: boolean,
        filterCollegeData: string | null,
        filterByFieldOfStudy: boolean,
        filterFieldOfStudyData: string | null,
        filterByYear: boolean,
        filterYearData: number | null,
        currentDomain: number
    }
) => {
    await prisma.waitingUser.createMany({
        data: [
            {
                profileId: profile1Id,
                socketId: p1SocketId,
                ...p1Prefs
            },
            {
                profileId: profile2Id,
                socketId: p2SocketId,
                ...p2Prefs
            }
        ]
    })

    return { success: true }
}

export const requeueOne = async (
    profileId: string,
    socketId: string,
    p1Prefs: {
        filterByGender: boolean,
        filterGenderData: string | null,
        filterByCollege: boolean,
        filterCollegeData: string | null,
        filterByFieldOfStudy: boolean,
        filterFieldOfStudyData: string | null,
        filterByYear: boolean,
        filterYearData: number | null,
        currentDomain: number
    }
) => {
    await prisma.waitingUser.create({
        data: {
            profileId,
            socketId,
            ...p1Prefs
        }
    })

    return { success: true }
}

export const onSkip = async (roomId: string, p1SocketId: string, p2SocketId: string) => {
    const session = await endSession(roomId)

    if (!session) {
        return null
    }

    await requeueBoth(
        session.profile1Id,
        session.profile2Id,
        p1SocketId,
        p2SocketId,
        session.p1Prefs,
        session.p2Prefs
    )

    return {
        success: true,
        profile1Id: session.profile1Id,
        profile2Id: session.profile2Id,
        p1Prefs: session.p1Prefs,
        p2Prefs: session.p2Prefs
    }
}

export const onDisconnected = async (roomId: string, disconnectedProfileId: string, remainingSocketId: string) => {
    const session = await endSession(roomId)

    if (!session) return null

    const remainingProfileId = session.profile1Id === disconnectedProfileId
        ? session.profile2Id
        : session.profile1Id

    const remainingPrefs = session.profile1Id === disconnectedProfileId
        ? session.p2Prefs
        : session.p1Prefs

    await requeueOne(remainingProfileId, remainingSocketId, remainingPrefs)

    return {
        success: true,
        remainingProfileId,
        remainingPrefs
    }
}

export const filterMatch = async () => {

}