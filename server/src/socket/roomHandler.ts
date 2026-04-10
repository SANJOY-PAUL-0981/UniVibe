import { type Server } from "socket.io";
import {
    makeActive,
    randomMatch,
    filterMatch,
    endSession,
    onSkip,
    onDisconnected,
    updateWaitingUser
} from "../utils/roomutils.js"
import { prisma } from "../lib/prisma.js";

const roomHandler = (io: Server) => {
    const timeoutMap = new Map<string, NodeJS.Timeout>()
    const socketRoomMap = new Map<string, { roomId: string, profileId: string }>()

    io.on('connection', (socket) => {
        socket.on('join', async ({ profileId, filters, currentDomain }) => {
            try {
                console.log("User connected: ", socket.id)
                let activeUser = await makeActive(profileId, socket.id, {...filters, currentDomain})

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
                        socket.emit('waiting', { message: 'looking for someone...' })

                        const timeOut = setTimeout(async () => {
                            try {
                                await prisma.waitingUser.delete({
                                    where: { profileId }
                                })
                                socket.emit("no_match_found")
                                timeoutMap.delete(profileId)
                            } catch (err) {
                                console.error(err)
                            }
                        }, 60000)

                        timeoutMap.set(profileId, timeOut)
                        return
                    }

                    const roomId = match.session.roomId
                    socket.join(roomId)

                    socketRoomMap.set(socket.id, { roomId, profileId })
                    socketRoomMap.set(match.matchedSocketId, { roomId, profileId: match.session.profile2Id })

                    clearTimeout(timeoutMap.get(profileId))
                    timeoutMap.delete(profileId)
                    clearTimeout(timeoutMap.get(match.session.profile2Id))
                    timeoutMap.delete(match.session.profile2Id)

                    io.to(match.matchedSocketId).socketsJoin(roomId)
                    io.to(roomId).emit('match_found', { roomId })
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
                            const roomId = matchWithGender.session.roomId

                            socketRoomMap.set(socket.id, { roomId, profileId })
                            socketRoomMap.set(matchWithGender.matchedSocketId, { roomId, profileId: matchWithGender.session.profile2Id })

                            clearTimeout(timeoutMap.get(profileId))
                            timeoutMap.delete(profileId)
                            clearTimeout(timeoutMap.get(matchWithGender.session.profile2Id))
                            timeoutMap.delete(matchWithGender.session.profile2Id)

                            socket.join(roomId)
                            io.to(matchWithGender.matchedSocketId).socketsJoin(roomId)
                            io.to(roomId).emit('match_found', { roomId })
                            return
                        }

                        socket.emit('waiting', { message: 'Looking for someone...' })
                        const timeout = setTimeout(async () => {
                            try {
                                await prisma.waitingUser.delete({ where: { profileId } })
                                socket.emit('no_match_found')
                                timeoutMap.delete(profileId)
                            } catch (err) {
                                console.error(err)
                            }
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
                                const roomId = matchWithFilter.session.roomId

                                socketRoomMap.set(socket.id, { roomId, profileId })
                                socketRoomMap.set(matchWithFilter.matchedSocketId, { roomId, profileId: matchWithFilter.session.profile2Id })

                                clearTimeout(timeoutMap.get(profileId))
                                timeoutMap.delete(profileId)
                                clearTimeout(timeoutMap.get(matchWithFilter.session.profile2Id))
                                timeoutMap.delete(matchWithFilter.session.profile2Id)

                                socket.join(roomId)
                                io.to(matchWithFilter.matchedSocketId).socketsJoin(roomId)
                                io.to(roomId).emit('match_found', { roomId })
                                return
                            }

                            const waitTime = domain === currentDomain ? 20000 : 10000
                            socket.emit('waiting', { message: 'Looking for someone with matching interests...' })

                            const timeOut = setTimeout(async () => {
                                try {
                                    console.log("timeout fired, domain was:", domain, "incrementing to:", domain + 1)
                                    timeoutMap.delete(profileId)
                                    domain++

                                    // fallback at random
                                    if (domain === 3) {
                                        const randomMatchResult = await randomMatch(profileId)

                                        if (randomMatchResult) {
                                            const roomId = randomMatchResult.session.roomId

                                            socketRoomMap.set(socket.id, { roomId, profileId })
                                            socketRoomMap.set(randomMatchResult.matchedSocketId, { roomId, profileId: randomMatchResult.session.profile2Id })

                                            clearTimeout(timeoutMap.get(profileId))
                                            timeoutMap.delete(profileId)
                                            clearTimeout(timeoutMap.get(randomMatchResult.session.profile2Id))
                                            timeoutMap.delete(randomMatchResult.session.profile2Id)

                                            socket.join(roomId)
                                            io.to(randomMatchResult.matchedSocketId).socketsJoin(roomId)
                                            io.to(roomId).emit('match_found', { roomId })
                                            return
                                        }

                                        socket.emit('waiting', { message: "Looking for anyone..." })
                                        const randomTimeout = setTimeout(async () => {
                                            try {
                                                await prisma.waitingUser.delete({ where: { profileId } })
                                                socket.emit('no_match_found')
                                                timeoutMap.delete(profileId)
                                            } catch (err) {
                                                console.error(err)
                                            }
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
                                } catch (err) {
                                    console.error(err)
                                }
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

        socket.on('skip', async ({ roomId }) => {
            try {
                const sockets = await io.in(roomId).fetchSockets()
                const socket1Id = sockets[0]?.id
                const socket2Id = sockets[1]?.id

                if (!socket1Id || !socket2Id) {
                    return null
                }

                const result = await onSkip(roomId, socket1Id, socket2Id)
                if (!result) return

                io.to(roomId).emit('skipped')
                io.socketsLeave(roomId)
                socketRoomMap.delete(socket1Id)
                socketRoomMap.delete(socket2Id)
            } catch (err) {
                console.error(err);

            }
        })

        socket.on('disconnect', async () => {
            try {
                console.log('User disconnected:', socket.id)

                const socketData = socketRoomMap.get(socket.id)

                if (!socketData) {
                    // user disconnected while waiting, not in a call
                    const waitingUser = await prisma.waitingUser.findFirst({
                        where: { socketId: socket.id }
                    })
                    if (waitingUser) {
                        clearTimeout(timeoutMap.get(waitingUser.profileId))
                        timeoutMap.delete(waitingUser.profileId)
                        await prisma.waitingUser.delete({
                            where: { profileId: waitingUser.profileId }
                        })
                    }
                    return
                }

                const { roomId, profileId } = socketData

                const sockets = await io.in(roomId).fetchSockets()
                const remainingSocket = sockets.find(s => s.id !== socket.id)
                const remainingSocketId = remainingSocket?.id

                if (!remainingSocketId) {
                    // no one left in room, just clean up
                    await endSession(roomId)
                    socketRoomMap.delete(socket.id)
                    return
                }

                const result = await onDisconnected(roomId, profileId, remainingSocketId)
                if (!result) return

                io.to(remainingSocketId).emit('peer_disconnected')

                socketRoomMap.delete(socket.id)
                socketRoomMap.delete(remainingSocketId)

                clearTimeout(timeoutMap.get(profileId))
                timeoutMap.delete(profileId)

            } catch (err) {
                console.error(err)
            }
        })
    })
}

export default roomHandler;