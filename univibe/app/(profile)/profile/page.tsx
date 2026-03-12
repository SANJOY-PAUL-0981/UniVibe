import { Button } from "@/components/ui/button"
import { signOutAction } from "@/actions/signOut.action"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const ProfilePage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/login")
    }

    return (
        <div className="flex justify-around p-10">
            <p className="text-2xl font-bold">
                Profile
            </p>
            <form action={signOutAction}>
                <Button
                    type="submit"
                >Log Out</Button>
            </form>
        </div>
    )
}

export default ProfilePage;