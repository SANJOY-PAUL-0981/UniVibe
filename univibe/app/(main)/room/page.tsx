"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const Room = () => {
  const router = useRouter()

  const handleStartGroupCall = () => {
    const groupId = crypto.randomUUID()
    router.push(`/group/${groupId}`)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div>Room</div>
      <Button onClick={handleStartGroupCall}>Start Group Call</Button>
    </div>
  )
}

export default Room
