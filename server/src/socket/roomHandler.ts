import { Socket, type Server } from "socket.io";
import {
    makeActive,
    randomMatch,
    filterMatch,
    endSession,
    requeueBoth,
    requeueOne,
    onSkip,
    onDisconnected,
    updateWaitingUser
} from "../utils/roomutils.js"
import { prisma } from "../lib/prisma.js";

const roomHandler = (io: Server) => {
    const timeoutMap = new Map<string, NodeJS.Timeout>()
    io.on('connection', (socket) => {
        socket.on('join', async ({ profileId, filters, currentDomain }) => {
            try {
                console.log("User connected: ", socket.id)
                let activeUser = await makeActive(profileId, socket.id, filters)

                if ('error' in activeUser) {
                    socket.emit('error', { message: activeUser.error })
                    return
                }

                const isRandom = !activeUser.waitingUser.filterByCollege &&
                    !activeUser.waitingUser.filterByFieldOfStudy &&
                    !activeUser.waitingUser.filterByGender &&
                    !activeUser.waitingUser.filterByYear

                if (isRandom) {
                    const match = await randomMatch(profileId)

                    if (!match) {
                        socket.emit('waiting', { message: 'lookin for someone...' })

                        const timeOut = setTimeout(async () => {
                            await prisma.waitingUser.delete({
                                where: { profileId }
                            })
                            socket.emit("no_match_found")
                            timeoutMap.delete(profileId)
                        }, 60000)

                        timeoutMap.set(profileId, timeOut)
                        return
                    }

                    const roomId = match.session.roomId
                    socket.join(roomId)

                    clearTimeout(timeoutMap.get(profileId))
                    timeoutMap.delete(profileId)
                    clearTimeout(timeoutMap.get(match.session.profile2Id))
                    timeoutMap.delete(match.session.profile2Id)

                    io.to(match.matchedSocketId).socketsJoin(roomId)
                    io.to(match.session.roomId).emit('match_found', { roomId })
                } else {
                    const profile = await prisma.profile.findUnique({
                        where: { id: profileId }
                    })
                    if (!profile) {
                        return null
                    }

                    let domain = currentDomain

                    const isOnlyGender = filters.filterByGender &&
                        !filters.filterByCollege &&
                        !filters.filterByYear &&
                        !filters.filterByFieldOfStudy

                    if (isOnlyGender) {
                        const matchWithGender = await filterMatch(profileId, 3, filters)

                        if (matchWithGender) {
                            clearTimeout(timeoutMap.get(profileId))
                            timeoutMap.delete(profileId)
                            clearTimeout(timeoutMap.get(matchWithGender.session.profile2Id))
                            timeoutMap.delete(matchWithGender.session.profile2Id)

                            const roomId = matchWithGender.session.roomId
                            socket.join(roomId)
                            io.to(matchWithGender.matchedSocketId).socketsJoin(roomId)
                            io.to(roomId).emit('match_found', { roomId })
                            return
                        }

                        socket.emit('waiting', { message: 'Looking for someone...' })
                        const timeout = setTimeout(async () => {
                            await prisma.waitingUser.delete({ where: { profileId } })
                            socket.emit('no_match_found')
                            timeoutMap.delete(profileId)
                        }, 60000)
                        timeoutMap.set(profileId, timeout)
                        return
                    }

                    const tryFilterMatch = async () => {
                        const currentFilters = {
                            ...filters,
                            ...(domain === 1 && { filterByCollege: false, filterCollegeData: null, filterByYear: true, filterYearData: profile.year }),
                            ...(domain === 2 && { filterByYear: false, filterYearData: null, filterByFieldOfStudy: true, filterFieldOfStudyData: profile.fieldOfStudy }),
                        }


                        if (domain < 3) {
                            const matchWithFilter = await filterMatch(profileId, domain, currentFilters)

                            if (matchWithFilter) {
                                clearTimeout(timeoutMap.get(profileId))
                                timeoutMap.delete(profileId)
                                clearTimeout(timeoutMap.get(matchWithFilter.session.profile2Id))
                                timeoutMap.delete(matchWithFilter.session.profile2Id)

                                const roomId = matchWithFilter.session.roomId
                                socket.join(roomId)
                                io.to(matchWithFilter.matchedSocketId).socketsJoin(roomId)
                                io.to(roomId).emit('match_found', { roomId })
                                return
                            }

                            const waitTime = domain === currentDomain ? 20000 : 10000
                            socket.emit('waiting', { message: 'Looking for someone with matching interests...' })

                            const timeOut = setTimeout(async () => {
                                timeoutMap.delete(profileId)
                                domain++

                                // fallback at random
                                if (domain === 3) {
                                    const randomMatchResult = await randomMatch(profileId)

                                    if (randomMatchResult) {
                                        clearTimeout(timeoutMap.get(profileId))
                                        timeoutMap.delete(profileId)
                                        clearTimeout(timeoutMap.get(randomMatchResult.session.profile2Id))
                                        timeoutMap.delete(randomMatchResult.session.profile2Id)

                                        const roomId = randomMatchResult.session.roomId
                                        socket.join(roomId)
                                        io.to(randomMatchResult.matchedSocketId).socketsJoin(roomId)
                                        io.to(roomId).emit('match_found', { roomId })
                                        return
                                    }

                                    socket.emit('waiting', { message: "Looking for someone..." })
                                    const randomTimeout = setTimeout(async () => {
                                        await prisma.waitingUser.delete({ where: { profileId } })
                                        socket.emit('no_match_found')
                                        timeoutMap.delete(profileId)
                                    }, 40000)
                                    timeoutMap.set(profileId, randomTimeout)
                                    return
                                }

                                await updateWaitingUser(profileId, {
                                    ...(domain === 1 && { filterByCollege: false, filterCollegeData: null, filterByYear: true, filterYearData: profile.year, currentDomain: 1 }),
                                    ...(domain === 2 && { filterByYear: false, filterYearData: null, filterByFieldOfStudy: true, filterFieldOfStudyData: profile.fieldOfStudy, currentDomain: 2 }),
                                })

                                socket.emit('searching_domain', { domain })
                                await tryFilterMatch()
                            }, waitTime)
                            timeoutMap.set(profileId, timeOut)
                        }
                    }
                    await tryFilterMatch()
                }
            } catch (err) {
                console.error(err)
            }
        })

        socket.on('disconnect', async () => {
            try {
                console.log('User disconnected:', socket.id)
            } catch (err) {
                console.error(err)
            }
        })
    })
}

export default roomHandler;