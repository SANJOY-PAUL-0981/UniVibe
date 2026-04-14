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
    const readyMap = new Map<string, Set<string>>()
    const roomLock = new Set<string>()

    io.on('connection', (socket) => {
        socket.on('join', async ({ profileId, filters, currentDomain }) => {
            try {
                if (timeoutMap.has(profileId)) {
                    clearTimeout(timeoutMap.get(profileId));
                    timeoutMap.delete(profileId);
                }
                console.log("User connected: ", socket.id)
                let activeUser = await makeActive(profileId, socket.id, { ...filters, currentDomain })

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
                    //io.to(roomId).emit('match_found', { roomId })
                    socket.emit('match_found', { roomId, isInitiator: true })
                    io.to(match.matchedSocketId).emit('match_found', { roomId, isInitiator: false })
                    /*setTimeout(() => {
                        io.to(roomId).emit("ready")
                    }, 5000)*/ // both works but efficiency high in the bottom one but sometimes bugs
                    //io.to(roomId).emit("ready")
                } else {
                    const profile = await prisma.profile.findUnique({
                        where: { id: profileId }
                    })
                    if (!profile) {
                        return null
                    }

                    const getDuration = (domain: number, currentDomain: number) => {
                        return domain === currentDomain ? 20 : 10
                    }

                    let domain = currentDomain
                    //socket.emit('searching_domain', { domain, duration: getDuration(domain, currentDomain) })

                    const isOnlyGender = filters.filterByGender &&
                        !filters.filterByCollege &&
                        !filters.filterByYear &&
                        !filters.filterByFieldOfStudy

                    if (isOnlyGender) {
                        socket.emit('searching_domain', { domain: 3, duration: 60 })
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
                            //io.to(roomId).emit('match_found', { roomId })
                            socket.emit('match_found', { roomId, isInitiator: true })
                            io.to(matchWithGender.matchedSocketId).emit('match_found', { roomId, isInitiator: false })
                            /*setTimeout(() => {
                                io.to(roomId).emit("ready")
                            }, 5000)*/ // both works but efficiency high in the bottom one but sometimes bugs
                            //io.to(roomId).emit("ready")
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
                    socket.emit('searching_domain', { domain, duration: getDuration(domain, currentDomain) })

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
                                //io.to(roomId).emit('match_found', { roomId })
                                socket.emit('match_found', { roomId, isInitiator: true })
                                io.to(matchWithFilter.matchedSocketId).emit('match_found', { roomId, isInitiator: false })
                                /*setTimeout(() => {
                                    io.to(roomId).emit("ready")
                                }, 5000)*/ // both works but efficiency high in the bottom one but sometimes bugs
                                //io.to(roomId).emit("ready")
                                return
                            }

                            const waitTime = domain === currentDomain ? 50000 : 10000
                            socket.emit('waiting', { message: 'Looking for someone with matching interests...' })

                            const timeOut = setTimeout(async () => {
                                try {
                                    console.log("timeout fired, domain was:", domain, "incrementing to:", domain + 1)
                                    clearTimeout(timeoutMap.get(profileId))
                                    timeoutMap.delete(profileId)
                                    domain++

                                    socket.emit('searching_domain', { domain: domain, duration: domain === 3 ? 60 : getDuration(domain, currentDomain) });

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
                                            //io.to(roomId).emit('match_found', { roomId })
                                            socket.emit('match_found', { roomId, isInitiator: true })
                                            io.to(randomMatchResult.matchedSocketId).emit('match_found', { roomId, isInitiator: false })
                                            /*setTimeout(() => {
                                                io.to(roomId).emit("ready")
                                            }, 5000)*/ // both works but efficiency high in the bottom one but sometimes bugs
                                            //io.to(roomId).emit("ready")
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
                                        }, 60000)
                                        timeoutMap.set(profileId, randomTimeout)
                                        return
                                    }

                                    await updateWaitingUser(profileId, {
                                        ...(domain === 1 && { filterByCollege: false, filterCollegeData: null, filterByYear: true, filterYearData: profile.year, currentDomain: 1 }),
                                        ...(domain === 2 && { filterByYear: false, filterYearData: null, filterByFieldOfStudy: true, filterFieldOfStudyData: profile.fieldOfStudy, currentDomain: 2 }),
                                    })

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

        /*socket.on('disconnect', async () => {
            try {
                console.log('User disconnected:', socket.id)

                const socketData = socketRoomMap.get(socket.id)

                if (!socketData) {
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
        })*/

        /*socket.on('disconnect', async () => {
            try {
                console.log('User disconnected:', socket.id)

                const socketData = socketRoomMap.get(socket.id)

                if (!socketData) {
                    const waitingUser = await prisma.waitingUser.findFirst({
                        where: { socketId: socket.id }
                    })

                    if (waitingUser) {
                        clearTimeout(timeoutMap.get(waitingUser.profileId))
                        timeoutMap.delete(waitingUser.profileId)

                        await prisma.waitingUser.deleteMany({
                            where: { profileId: waitingUser.profileId }
                        })
                    }

                    return
                }

                const { roomId, profileId } = socketData

                if (roomLock.has(roomId)) {
                    await prisma.waitingUser.deleteMany({
                        where: { socketId: socket.id }
                    })
                    return
                }

                roomLock.add(roomId)

                try {
                    const sockets = await io.in(roomId).fetchSockets()
                    const remainingSocket = sockets.find(s => s.id !== socket.id)
                    const remainingSocketId = remainingSocket?.id

                    if (!remainingSocketId) {
                        await endSession(roomId)
                        socketRoomMap.delete(socket.id)
                    } else {
                        const result = await onDisconnected(
                            roomId,
                            profileId,
                            remainingSocketId
                        )

                        if (result) {
                            io.to(remainingSocketId).emit('peer_disconnected')
                        }

                        socketRoomMap.delete(socket.id)
                        socketRoomMap.delete(remainingSocketId)
                    }

                    clearTimeout(timeoutMap.get(profileId))
                    timeoutMap.delete(profileId)

                } finally {
                    roomLock.delete(roomId)
                }

                await prisma.waitingUser.deleteMany({
                    where: {
                        OR: [
                            { socketId: socket.id },
                            { profileId }
                        ]
                    }
                })

            } catch (err) {
                console.error(err)
            }
        })*/

        socket.on('disconnect', async () => {
            try {
                console.log('🔥 DISCONNECT:', socket.id)

                const socketData = socketRoomMap.get(socket.id)

                // ✅ CASE 1: user not in room
                if (!socketData) {
                    const waitingUser = await prisma.waitingUser.findFirst({
                        where: { socketId: socket.id }
                    })

                    if (waitingUser) {
                        clearTimeout(timeoutMap.get(waitingUser.profileId))
                        timeoutMap.delete(waitingUser.profileId)
                    }

                    // ✅ cleanup self
                    await prisma.waitingUser.deleteMany({
                        where: { socketId: socket.id }
                    })

                    return
                }

                const { roomId, profileId } = socketData

                const sockets = await io.in(roomId).fetchSockets()
                const remainingSocket = sockets.find(s => s.id !== socket.id)
                const remainingSocketId = remainingSocket?.id

                if (!remainingSocketId) {
                    // ✅ no one left → just delete session
                    await prisma.callSession.delete({
                        where: { roomId }
                    }).catch(() => { })

                    socketRoomMap.delete(socket.id)
                } else {
                    const result = await onDisconnected(
                        roomId,
                        profileId,
                        remainingSocketId
                    )

                    if (result) {
                        io.to(remainingSocketId).emit('peer_disconnected')
                    }

                    socketRoomMap.delete(socket.id)
                    socketRoomMap.delete(remainingSocketId)
                }

                clearTimeout(timeoutMap.get(profileId))
                timeoutMap.delete(profileId)

                // ✅ FINAL CLEANUP (CRITICAL)
                await prisma.waitingUser.deleteMany({
                    where: {
                        OR: [
                            { socketId: socket.id },
                            { profileId }
                        ]
                    }
                })

                // ✅ FINAL SESSION SAFETY (kills ghost sessions)
                await prisma.callSession.delete({
                    where: { roomId }
                }).catch(() => { })

            } catch (err) {
                console.error(err)
            }
        })

        socket.on("client_ready", ({ roomId }) => {
            if (!readyMap.has(roomId)) {
                readyMap.set(roomId, new Set())
            }

            const set = readyMap.get(roomId)!
            set.add(socket.id)

            console.log("client_ready:", roomId, set.size)

            if (set.size === 2) {
                console.log("Both ready → emitting ready")

                io.to(roomId).emit("ready")
                readyMap.delete(roomId)
            }
        })
    })
}

export default roomHandler;