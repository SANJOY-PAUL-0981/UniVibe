import UserDetailsForm from "@/components/layouts/UserDetailsForm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

const UserDetails = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/auth/login")

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  if (profile) redirect("/")

  return <UserDetailsForm />
}

export default UserDetails