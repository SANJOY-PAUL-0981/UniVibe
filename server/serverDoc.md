To install dependencies:
```sh
npm install
```

To run:
```sh
npm run dev
```

open http://localhost:8080

# Backend Documentation

## Overview

UniVibe uses a **Socket.io** server built with **Node.js + Hono** for real-time video call matchmaking and WebRTC signaling. The database is **NeonDB (PostgreSQL)** managed via **Prisma**.

---

## Socket Events

### Client → Server

---

#### `join`
Emitted when a user clicks "Start Call" or "Filter → Start Call".

**Payload:**
```json
{
  "profileId": "string",
  "currentDomain": "number (0=college | 1=year | 2=fieldOfStudy | 3=random)",
  "filters": {
    "filterByGender": "boolean",
    "filterGenderData": "string | null",
    "filterByCollege": "boolean",
    "filterCollegeData": "string | null",
    "filterByFieldOfStudy": "boolean",
    "filterFieldOfStudyData": "string | null",
    "filterByYear": "boolean",
    "filterYearData": "number | null",
    "currentDomain": "number"
  }
}
```

**Behavior:**
- Adds user to `WaitingUser` table
- If all filters false → `randomMatch()`
- If only gender filter → `filterMatch()` with domain 3
- Else → `filterMatch()` with fallback loop (domain 0 → 1 → 2 → 3)

---

#### `skip`
Emitted when a user clicks the skip button during a call.

**Payload:**
```json
{
  "roomId": "string"
}
```

**Behavior:**
- Ends the current `CallSession`
- Requeues both users into `WaitingUser` with original filter prefs
- Both users receive `skipped` event

---

#### `signal`
Emitted to relay WebRTC signaling data (offer, answer, ICE candidates) between peers.

**Payload:**
```json
{
  "roomId": "string",
  "signal": {
    "type": "offer | answer | ice_candidate",
    "sdp": "object (for offer/answer)",
    "candidate": "object (for ICE)"
  }
}
```

**Behavior:**
- Server relays signal to the other peer in the room
- Server never processes the signal — pure relay

---

### Server → Client

---

#### `match_found`
Emitted to both users when a match is successfully made.

**Payload:**
```json
{
  "roomId": "string"
}
```

---

#### `waiting`
Emitted when no immediate match is found — user is in queue.

**Payload:**
```json
{
  "message": "string"
}
```

---

#### `searching_domain`
Emitted during fallback — informs client which domain level is now being searched.

**Payload:**
```json
{
  "domain": "number (1=year | 2=fieldOfStudy | 3=random)"
}
```

**Client should use domain to render:**
- `1` → "Expanding to your year..."
- `2` → "Expanding to your field of study..."
- `3` → "Searching randomly..."

---

#### `no_match_found`
Emitted when search times out with no match found.

**Payload:** none

**Behavior:** Client should show "Start Call" and "Filter" buttons for retry.

---

#### `skipped`
Emitted to both users when skip is triggered.

**Payload:** none

**Behavior:** Client should reset UI and show retry buttons.

---

#### `peer_disconnected`
Emitted to the remaining user when the other person disconnects unexpectedly.

**Payload:** none

**Behavior:** Client should show retry buttons, remaining user is already requeued.

---

#### `error`
Emitted when `makeActive()` fails — user is already waiting or in a call.

**Payload:**
```json
{
  "message": "string"
}
```

---

#### `signal`
Emitted to the receiving peer with relayed WebRTC signaling data.

**Payload:**
```json
{
  "signal": "object (same as sent by the other peer)"
}
```

---

## Matchmaking Flow

### Random Match
```
join (all filters false)
  → makeActive() → insert into WaitingUser
  → randomMatch() → search WaitingUser where all filters false, oldest createdAt first
  → if match → create CallSession → delete both from WaitingUser → emit match_found
  → if no match → emit waiting → 60s timer → delete from WaitingUser → emit no_match_found
```

### Filter Match with Fallback
```
join (filters active)
  → makeActive() → insert into WaitingUser
  → filterMatch(domain=0) → 20s
  → if no match → updateWaitingUser(domain=1, year=profile.year) → filterMatch(domain=1) → 10s
  → if no match → updateWaitingUser(domain=2, fieldOfStudy=profile.fieldOfStudy) → filterMatch(domain=2) → 10s
  → if no match → randomMatch() → 40s timer → no_match_found
```

### Gender Only Match
```
join (only filterByGender active)
  → makeActive() → insert into WaitingUser
  → filterMatch(domain=3, genderOnly=true)
  → if match → emit match_found
  → if no match → 60s timer → no_match_found
```

---

## roomUtils.ts Functions

---

### `makeActive(profileId, socketId, filters)`
Adds a user to the `WaitingUser` table before matchmaking begins.

- Checks if user is already in `WaitingUser` → if yes, updates `socketId` and returns existing row
- Checks if user is already in `CallSession` → if yes, returns error
- Creates `WaitingUser` row with active filters AND original filters (originals never change during fallback)

**Returns:** `{ success: true, waitingUser }` or `{ error: string }`

---

### `randomMatch(profileId)`
Finds a random match for a user with no active filters.

- Searches `WaitingUser` where all filter flags are false
- Excludes the initiator
- Orders by `createdAt asc` (longest waiting first)
- Creates `CallSession` with both users' original prefs
- Deletes both from `WaitingUser`

**Returns:** `{ success, session, matchedSocketId }` or `null`

---

### `filterMatch(profileId, currentDomain, filters)`
Finds a filtered match using two-way profile compatibility check.

- Fetches initiator's `Profile` for actual values (college, year, fieldOfStudy, gender)
- **Two-way check:** finds candidates who want to meet someone from YOUR college/year/fieldOfStudy AND whose profile matches what YOU want
- Supports gender as additional condition on any domain
- Supports gender-only path (`isOnlyGender`)
- Creates `CallSession` with both users' original prefs
- Deletes both from `WaitingUser`

**Domain mapping:**
- `0` → college filter
- `1` → year filter
- `2` → fieldOfStudy filter
- `3` → gender only (no domain)

**Returns:** `{ success, session, matchedSocketId }` or `null`

---

### `updateWaitingUser(profileId, data)`
Updates a user's `WaitingUser` row during fallback.

- Used to toggle filter flags and update `currentDomain` as fallback progresses
- Only updates fields passed in `data`

**Returns:** `{ success, updated }`

---

### `endSession(roomId)`
Ends an active call session.

- Finds `CallSession` by `roomId`
- Saves both users' profileIds and filter prefs before deleting
- Deletes `CallSession`

**Returns:** `{ profile1Id, profile2Id, p1Prefs, p2Prefs }` or `null`

---

### `requeueBoth(profile1Id, profile2Id, p1SocketId, p2SocketId, p1Prefs, p2Prefs)`
Reinserts both users into `WaitingUser` after skip.

- Uses original filter prefs from `CallSession` (not fallback-modified values)
- Sets both active AND original filter fields to restore state correctly

**Returns:** `{ success: true }`

---

### `requeueOne(profileId, socketId, prefs)`
Reinserts a single user into `WaitingUser` after peer disconnect.

- Same as `requeueBoth` but for one user
- The disconnected user is NOT requeued — they go back to home

**Returns:** `{ success: true }`

---

### `onSkip(roomId, p1SocketId, p2SocketId)`
Handles skip logic.

- Calls `endSession()` to get prefs and clean up `CallSession`
- Calls `requeueBoth()` to reinsert both users

**Returns:** `{ success, profile1Id, profile2Id, p1Prefs, p2Prefs }` or `null`

---

### `onDisconnected(roomId, disconnectedProfileId, remainingSocketId)`
Handles disconnect logic.

- Calls `endSession()` to get prefs and clean up `CallSession`
- Identifies remaining user by comparing `disconnectedProfileId` with session profileIds
- Calls `requeueOne()` for the remaining user only

**Returns:** `{ success, remainingProfileId, remainingPrefs }` or `null`

---

## Domain Hierarchy

```
0 = college     (most specific, 20s initial search)
1 = year        (fallback 1, 10s, auto-applied from profile)
2 = fieldOfStudy (fallback 2, 10s, auto-applied from profile)
3 = random      (broadest, fallback final)
```

---

## In-Memory Maps (roomHandler.ts)

### `timeoutMap` — `Map<profileId, Timeout>`
Stores active search timeouts per user. Cleared when match is found or search ends.

### `socketRoomMap` — `Map<socketId, { roomId, profileId }>`
Stores active call room data per socket. Used on disconnect to identify which room the user was in. Cleared when session ends.