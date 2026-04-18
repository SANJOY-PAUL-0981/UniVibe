import { getMainUserData } from "@/lib/getMainUserData"
import CallClient from "@/components/call/CallClient"

type Props = {
    params: Promise<{ callId: string }>
    searchParams: Promise<{ isInitiator: string }>
}

export default async function CallPage({ params, searchParams }: Props) {
    const { profile } = await getMainUserData()
    const { callId } = await params

    const { isInitiator } = await searchParams

    return (
        <CallClient
            profileId={profile.id}
            roomId={callId}
            isInitiator={isInitiator === "true"}
        />
    )
}