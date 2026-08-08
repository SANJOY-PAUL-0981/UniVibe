"use client";

import { useEffect, useRef } from "react";
import { useProfileStore, type MainUserData } from "@/store/useProfileStore";

type Props = {
    initialUser: MainUserData;
};

export default function ProfileStoreHydrator({ initialUser }: Props) {
    const hydratedRef = useRef(false);
    const setProfileFromServer = useProfileStore((state) => state.setProfileFromServer);

    useEffect(() => {
        if (hydratedRef.current) return;
        setProfileFromServer(initialUser);
        hydratedRef.current = true;
    }, [initialUser, setProfileFromServer]);

    return null;
}