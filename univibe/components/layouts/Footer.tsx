"use client"

import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Image from "next/image";



const Footer = () => {
    return (
        <div className="flex justify-around border-t-2 items-center p-10">
            <div className="">
                <Image
                    src="/logo.png"
                    alt="Logo"
                    width={250}
                    height={46}
                    className="shrink-0 invert dark:invert-0"
                />
            </div>

            <p>Made By <a href="https://x.com/Sanj0yX" className="underline font-bold text-blue-500">@Sanj0yX</a> & <a href="https://x.com/skmahirashef04" className="underline font-bold text-blue-500">@skmahirashef04</a></p>

            <div className="flex gap-2">
                <a href="https://x.com/"><FaXTwitter className="text-4xl" /></a>
                <a href="https://www.instagram.com/univibe.chat?igsh=MjNib3J1ZWN5eGpv"><FaInstagram className="text-4xl" /></a>
            </div>
        </div>
    )
}

export default Footer