import { getMainUserData } from "@/lib/getMainUserData"
import CallClient from "@/components/call/CallClient"

type Props = {
    params: Promise<{ callId: string }>
}

export default async function CallPage({ params }: Props) {
    const { profile } = await getMainUserData()
    const { callId } = await params

    return (
        <CallClient
            profileId={profile.id}
            roomId={callId}
        />
    )
}