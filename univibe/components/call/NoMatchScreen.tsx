"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import { useCallStore } from "@/store/useCallStore";
import { useEffect } from "react";

export const NoMatchScreen = () => {
    const router = useRouter();
    const { reset } = useCallStore()

    useEffect(() => { reset() }, [])

    const handleTryAgain = () => {
        router.push("/home")
    }
    return (
        <div>
            <p>No Match Found</p>
            <Button onClick={handleTryAgain}>
                Try Again!
            </Button>
        </div>
    )
}