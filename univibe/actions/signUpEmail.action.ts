"use server"

import { auth } from "@/lib/auth"

export const signUpEmailAction = async (formData: FormData) => {
    const name = String(formData.get("name"))
    if (!name) {
        return {
            error: "Please Enter Your Name"
        }
    }

    const email = String(formData.get("email"))
    if (!email) {
        return {
            error: "Please Enter Your Email"
        }
    }

    const password = String(formData.get("password"))
    if (!password) {
        return {
            error: "Please Enter Your Password"
        }
    }

    const confirmPassword = String(formData.get("confirmPassword"))
    if(password != confirmPassword){
        return{
            error: "Password Not Matching"
        }
    }

    try{
        await auth.api.signUpEmail({
            body:{
                name,
                email,
                password
            }
        })

        return { error: null }
    }catch(err){
        if(err instanceof Error){
            return{
                error: err.message
            }
        }

        return{
            error: "Internal Server Error!"
        }
    }
}