import { prisma } from "../lib/prisma.js"

const startCleanupJobs = () => {

    console.log("Cleanup jobs started", new Date().toISOString())

    setInterval(async () => {
        try {
            const cutoff = new Date(Date.now() - 30 * 60 * 1000)

            const deleted = await prisma.waitingUser.deleteMany({
                where: {
                    createdAt: { lt: cutoff }
                }
            })

            if (deleted.count > 0) {
                console.log(`Removed ${deleted.count} WaitingUsers`)
            }
        } catch (err) {
            console.error("WaitingUser cleanup failed:", err)
        }
    }, 5 * 60 * 1000)


    setInterval(async () => {
        try {
            const cutoff = new Date(Date.now() - 60 * 60 * 1000)

            const deleted = await prisma.callSession.deleteMany({
                where: {
                    startedAt: { lt: cutoff }
                }
            })

            if (deleted.count > 0) {
                console.log(`Removed ${deleted.count} CallSessions`)
            }
        } catch (err) {
            console.error("CallSession cleanup failed:", err)

        }
    }, 10 * 60 * 1000)
}

export default startCleanupJobs