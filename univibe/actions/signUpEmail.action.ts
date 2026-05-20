"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
const isEduEmail = (email: string) => {
    const domain = email.split("@")[1] ?? "";
    return domain.toLowerCase().includes(".edu");
}

export const signUpEmailAction = async (formData: FormData) => {
    const name = String(formData.get("name"))
    if (!name) {
        return {
            error: "Please Enter Your Name"
        }
    }

    const email = String(formData.get("email") ?? "").trim().toLowerCase()
    if (!email) {
        return {
            error: "Please Enter Your Email"
        }
    }

    if (!isEduEmail(email)) {
        return { error: "Use a valid educational email containing .edu (e.g. college.edu or college.edu.in)" }
    }

    const password = String(formData.get("password"))
    if (!password) {
        return {
            error: "Please Enter Your Password"
        }
    }

    const confirmPassword = String(formData.get("confirmPassword"))
    if (password != confirmPassword) {
        return {
            error: "Password Not Matching"
        }
    }

    try {
        const exists = await prisma.user.findUnique({
            where: { email }
        })
        if (exists) {
            return {
                error: "User Already Exists"
            }
        }
        await auth.api.signUpEmail({
            body: {
                name,
                email,
                password
            }
        })

        return { error: null }
    } catch (err) {
        if (err instanceof Error) {
            return {
                error: err.message
            }
        }

        return {
            error: "Internal Server Error!"
        }
    }
}