"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const Home = () => {
  const router = useRouter()

  const handleStartCall = () => {
    const callId = crypto.randomUUID()
    router.push(`/call/${callId}`)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div>Home</div>
      <Button onClick={handleStartCall}>Start Single Call</Button>
    </div>
  )
}

export default Home
