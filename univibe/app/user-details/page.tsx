import UserDetailsForm from "@/components/ui/UserDetailsForm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const UserDetails = async() => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/login")
    }

    return (
        <UserDetailsForm />
    )
}

export default UserDetails;