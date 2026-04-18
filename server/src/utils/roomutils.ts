import { prisma } from "../lib/prisma.js";

export type MatchFilters = {
    filterByGender?: boolean
    filterGenderData?: string
    filterByCollege?: boolean
    filterCollegeData?: string
    filterByFieldOfStudy?: boolean
    filterFieldOfStudyData?: string
    filterByYear?: boolean
    filterYearData?: number | string | null
}

export const makeActive = async (profileId: string, socketId: string, filters: {
    filterByGender?: boolean,
    filterGenderData?: string
    filterByCollege?: boolean,
    filterCollegeData?: string
    filterByFieldOfStudy?: boolean,
    filterFieldOfStudyData?: string,
    filterByYear?: boolean,
    filterYearData?: number | string
    currentDomain?: number
}) => {
    const alreadyWaiting = await prisma.waitingUser.findUnique({
        where: { profileId }
    })

    if (alreadyWaiting) {
        await prisma.waitingUser.update({
            where: {
                profileId
            },
            data: {
                socketId
            }
        })
        return {
            success: true,
            waitingUser: alreadyWaiting
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

    const year =
        filters.filterYearData === "" || filters.filterYearData === undefined
            ? null
            : Number(filters.filterYearData)

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
            filterYearData: year,
            currentDomain: filters.currentDomain ?? 3,

            originalFilterByCollege: filters.filterByCollege ?? false,
            originalFilterCollegeData: filters.filterCollegeData,
            originalFilterByFieldOfStudy: filters.filterByFieldOfStudy ?? false,
            originalFilterFieldOfStudyData: filters.filterFieldOfStudyData,
            originalFilterByGender: filters.filterByGender ?? false,
            originalFilterGenderData: filters.filterGenderData,
            originalFilterByYear: filters.filterByYear ?? false,
            originalFilterYearData: year,
            originalCurrentDomain: filters.currentDomain ?? 3,
        }
    })

    return {
        success: true,
        waitingUser
    }
}

export const randomMatch = async (profileId: string, profileCooldown: Map<string, number>) => {
    const now = Date.now()

    if (profileCooldown.has(profileId)) {
        const last = profileCooldown.get(profileId)!
        if (now - last < 2000) {
            return null
        }
    }
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

    const existingSession = await prisma.callSession.findFirst({
        where: {
            OR: [
                {
                    profile1Id: profileId,
                    profile2Id: match.profileId
                },
                {
                    profile1Id: match.profileId,
                    profile2Id: profileId
                }
            ]
        }
    })

    if (existingSession) {
        console.log("Reusing existing session:", existingSession.roomId)
        await prisma.waitingUser.deleteMany({
            where: {
                profileId: { in: [profileId, match.profileId] }
            }
        })

        return {
            success: true,
            session: existingSession,
            matchedSocketId: match.socketId
        }
    }

    const session = await prisma.callSession.create({
        data: {
            profile1Id: profileId,
            profile2Id: match.profileId,

            p1CurrentDomain: initiatorData.originalCurrentDomain,

            p1FilterByCollege: initiatorData.originalFilterByCollege,
            p1FilterCollegeData: initiatorData.originalFilterCollegeData,
            p1FilterByFieldOfStudy: initiatorData.originalFilterByFieldOfStudy,
            p1FilterFieldOfStudyData: initiatorData.originalFilterFieldOfStudyData,
            p1FilterByGender: initiatorData.originalFilterByGender,
            p1FilterGenderData: initiatorData.originalFilterGenderData,
            p1FilterByYear: initiatorData.originalFilterByYear,
            p1FilterYearData: initiatorData.originalFilterYearData,

            p2CurrentDomain: match.originalCurrentDomain,

            p2FilterByCollege: match.originalFilterByCollege,
            p2FilterCollegeData: match.originalFilterCollegeData,
            p2FilterByFieldOfStudy: match.originalFilterByFieldOfStudy,
            p2FilterFieldOfStudyData: match.originalFilterFieldOfStudyData,
            p2FilterByGender: match.originalFilterByGender,
            p2FilterGenderData: match.originalFilterGenderData,
            p2FilterByYear: match.originalFilterByYear,
            p2FilterYearData: match.originalFilterYearData
        }
    })

    await prisma.waitingUser.deleteMany({
        where: {
            profileId: { in: [profileId, match.profileId] }
        }
    })

    return {
        success: true,
        session,
        matchedSocketId: match.socketId
    }
}

export const endSession = async (roomId: string) => {
    const session = await prisma.callSession.delete({
        where: { roomId }
    }).catch(() => null)

    if (!session) {
        return null
    }

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
                ...p1Prefs,
                originalFilterByGender: p1Prefs.filterByGender,
                originalFilterGenderData: p1Prefs.filterGenderData,
                originalFilterByCollege: p1Prefs.filterByCollege,
                originalFilterCollegeData: p1Prefs.filterCollegeData,
                originalFilterByFieldOfStudy: p1Prefs.filterByFieldOfStudy,
                originalFilterFieldOfStudyData: p1Prefs.filterFieldOfStudyData,
                originalFilterByYear: p1Prefs.filterByYear,
                originalFilterYearData: p1Prefs.filterYearData,
                originalCurrentDomain: p1Prefs.currentDomain
            },
            {
                profileId: profile2Id,
                socketId: p2SocketId,
                ...p2Prefs,
                originalFilterByGender: p2Prefs.filterByGender,
                originalFilterGenderData: p2Prefs.filterGenderData,
                originalFilterByCollege: p2Prefs.filterByCollege,
                originalFilterCollegeData: p2Prefs.filterCollegeData,
                originalFilterByFieldOfStudy: p2Prefs.filterByFieldOfStudy,
                originalFilterFieldOfStudyData: p2Prefs.filterFieldOfStudyData,
                originalFilterByYear: p2Prefs.filterByYear,
                originalFilterYearData: p2Prefs.filterYearData,
                originalCurrentDomain: p2Prefs.currentDomain
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
            ...p1Prefs,
            originalFilterByGender: p1Prefs.filterByGender,
            originalFilterGenderData: p1Prefs.filterGenderData,
            originalFilterByCollege: p1Prefs.filterByCollege,
            originalFilterCollegeData: p1Prefs.filterCollegeData,
            originalFilterByFieldOfStudy: p1Prefs.filterByFieldOfStudy,
            originalFilterFieldOfStudyData: p1Prefs.filterFieldOfStudyData,
            originalFilterByYear: p1Prefs.filterByYear,
            originalFilterYearData: p1Prefs.filterYearData,
            originalCurrentDomain: p1Prefs.currentDomain
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

export const onDisconnected = async (
    roomId: string,
    disconnectedProfileId: string,
    remainingSocketId: string
) => {

    const session = await prisma.callSession.delete({
        where: { roomId }
    }).catch(() => null)

    if (!session) return null

    const p1Prefs = {
        filterByGender: session.p1FilterByGender,
        filterGenderData: session.p1FilterGenderData,
        filterByCollege: session.p1FilterByCollege,
        filterCollegeData: session.p1FilterCollegeData,
        filterByFieldOfStudy: session.p1FilterByFieldOfStudy,
        filterFieldOfStudyData: session.p1FilterFieldOfStudyData,
        filterByYear: session.p1FilterByYear,
        filterYearData: session.p1FilterYearData,
        currentDomain: session.p1CurrentDomain
    }

    const p2Prefs = {
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

    const remainingProfileId =
        session.profile1Id === disconnectedProfileId
            ? session.profile2Id
            : session.profile1Id

    const remainingPrefs =
        session.profile1Id === disconnectedProfileId
            ? p2Prefs
            : p1Prefs

    await prisma.waitingUser.deleteMany({
        where: { profileId: remainingProfileId }
    })

    await prisma.waitingUser.create({
        data: {
            profileId: remainingProfileId,
            socketId: remainingSocketId,

            ...remainingPrefs,

            originalFilterByGender: remainingPrefs.filterByGender,
            originalFilterGenderData: remainingPrefs.filterGenderData,
            originalFilterByCollege: remainingPrefs.filterByCollege,
            originalFilterCollegeData: remainingPrefs.filterCollegeData,
            originalFilterByFieldOfStudy: remainingPrefs.filterByFieldOfStudy,
            originalFilterFieldOfStudyData: remainingPrefs.filterFieldOfStudyData,
            originalFilterByYear: remainingPrefs.filterByYear,
            originalFilterYearData: remainingPrefs.filterYearData,
            originalCurrentDomain: remainingPrefs.currentDomain
        }
    })

    return {
        success: true,
        remainingProfileId
    }
}

export const filterMatch = async (
    profileId: string,
    currentDomain: number,
    profileCooldown: Map<string, number>,
    filters: MatchFilters
) => {
    const now = Date.now()

    if (profileCooldown.has(profileId)) {
        const last = profileCooldown.get(profileId)!
        if (now - last < 2000) {
            return null
        }
    }

    const initiatorProfile = await prisma.profile.findUnique({
        where: { id: profileId }
    })

    if (!initiatorProfile) return null

    const initiatorData = await prisma.waitingUser.findUnique({
        where: { profileId }
    })

    if (!initiatorData) return null

    const yearFilter =
        filters.filterYearData !== undefined && filters.filterYearData !== null
            ? Number(filters.filterYearData)
            : null

    const match = await prisma.waitingUser.findFirst({
        where: {
            NOT: { profileId },

            ...(filters.filterByGender && {
                filterByGender: true,
                filterGenderData: initiatorProfile.gender,
                profile: {
                    gender: filters.filterGenderData
                }
            }),

            ...(currentDomain === 0 && {
                filterByCollege: true,
                filterCollegeData: initiatorProfile.college
            }),

            ...(currentDomain === 1 && {
                filterByYear: true,
                filterYearData: initiatorProfile.year
            }),

            ...(currentDomain === 2 && {
                filterByFieldOfStudy: true,
                filterFieldOfStudyData: initiatorProfile.fieldOfStudy
            })
        },
        include: { profile: true },
        orderBy: { createdAt: "asc" }
    })

    if (!match) return null

    const domainMatch =
        currentDomain === 0 ? match.profile.college === filters.filterCollegeData :
            currentDomain === 1 ? match.profile.year === yearFilter :
                currentDomain === 2 ? match.profile.fieldOfStudy === filters.filterFieldOfStudyData :
                    true

    if (!domainMatch) return null

    const existingSession = await prisma.callSession.findFirst({
        where: {
            OR: [
                { profile1Id: profileId, profile2Id: match.profileId },
                { profile1Id: match.profileId, profile2Id: profileId }
            ]
        }
    })

    if (existingSession) {
        console.log("Reusing existing session:", existingSession.roomId)
        await prisma.waitingUser.deleteMany({
            where: { profileId: { in: [profileId, match.profileId] } }
        })
        return {
            success: true,
            session: existingSession,
            matchedSocketId: match.socketId
        }
    }

    const session = await prisma.callSession.create({
        data: {
            profile1Id: profileId,
            profile2Id: match.profileId,

            p1CurrentDomain: initiatorData.originalCurrentDomain,
            p1FilterByCollege: initiatorData.originalFilterByCollege,
            p1FilterCollegeData: initiatorData.originalFilterCollegeData,
            p1FilterByFieldOfStudy: initiatorData.originalFilterByFieldOfStudy,
            p1FilterFieldOfStudyData: initiatorData.originalFilterFieldOfStudyData,
            p1FilterByGender: initiatorData.originalFilterByGender,
            p1FilterGenderData: initiatorData.originalFilterGenderData,
            p1FilterByYear: initiatorData.originalFilterByYear,
            p1FilterYearData: initiatorData.originalFilterYearData,

            p2CurrentDomain: match.originalCurrentDomain,
            p2FilterByCollege: match.originalFilterByCollege,
            p2FilterCollegeData: match.originalFilterCollegeData,
            p2FilterByFieldOfStudy: match.originalFilterByFieldOfStudy,
            p2FilterFieldOfStudyData: match.originalFilterFieldOfStudyData,
            p2FilterByGender: match.originalFilterByGender,
            p2FilterGenderData: match.originalFilterGenderData,
            p2FilterByYear: match.originalFilterByYear,
            p2FilterYearData: match.originalFilterYearData
        }
    })

    await prisma.waitingUser.deleteMany({
        where: { profileId: { in: [profileId, match.profileId] } }
    })

    return {
        success: true,
        session,
        matchedSocketId: match.socketId
    }
}

export const updateWaitingUser = async (profileId: string, data: {
    filterByCollege?: boolean,
    filterCollegeData?: string | null,
    filterByFieldOfStudy?: boolean,
    filterFieldOfStudyData?: string | null,
    filterByGender?: boolean,
    filterGenderData?: string | null,
    filterByYear?: boolean,
    filterYearData?: number | null,
    currentDomain?: number
}) => {
    const updated = await prisma.waitingUser.update({
        where: { profileId },
        data
    })

    return { success: true, updated }
}