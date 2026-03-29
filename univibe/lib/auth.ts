import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { sendEmailAction } from "@/actions/sendEmail.action";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql"
    }),

    socialProviders: {
        google: {
            clientId: String(process.env.GOOGLE_CLIENT_ID),
            clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true
    },

    emailVerification: {
        sendOnSignUp: true,
        expiresIn: 60 * 60,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            const verificationUrl = new URL(url);
            verificationUrl.searchParams.set("callbackURL", "/auth/callback"); // this sending always to /user-details this needed to be dynamic

            const result = await sendEmailAction({
                to: user.email,
                subject: "Verify your email address",
                meta: {
                    description: "Please verify your email to complete the Sign Up.",
                    link: verificationUrl.toString()
                }
            }) as { success: boolean; error?: string };

            if (!result.success) {
                throw new Error(result.error ?? "Failed to send verification email");
            }
        }
    },

    session: {
        expiresIn: 60 * 60 * 24 * 15,
    },

    plugins: [nextCookies()]
}) 