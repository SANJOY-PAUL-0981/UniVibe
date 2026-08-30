"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'

const Room = () => {

  return (
    <div className="flex flex-col items-center justify-center gap-2 md:gap-4 md:text-5xl 3xl font-bold h-[80vh]">
      Coming Soon!
      <Link href="/home">
        <Button className={"cursor-pointer"}>Home</Button>
      </Link>
    </div>
  )
}

export default Room
