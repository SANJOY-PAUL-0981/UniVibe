import { create } from "zustand"

type Filters = {
    filterByGender: boolean;
    filterGenderData: string;
    filterByCollege: boolean;
    filterCollegeData: string;
    filterByYear: boolean;
    filterYearData: string;
    filterByFieldOfStudy: boolean;
    filterFieldOfStudyData: string;
}

type CallStatus = "idle" | "waiting" | "connected" | "ended"

type CallStore = {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    roomId: string | null;
    callStatus: CallStatus;
    filters: Filters;
    currentDomain: number;

    setLocalStream: (stream: MediaStream | null) => void;
    setRemoteStream: (stream: MediaStream | null) => void;
    setRoomId: (id: string | null) => void;
    setCallStatus: (status: CallStatus) => void;
    setFilters: (filters: Filters, currentDomain: number) => void;
    reset: () => void;
}

const defaultFilters: Filters = {
    filterByGender: false,
    filterGenderData: "",
    filterByCollege: false,
    filterCollegeData: "",
    filterByYear: false,
    filterYearData: "",
    filterByFieldOfStudy: false,
    filterFieldOfStudyData: ""
}

export const useCallStore = create<CallStore>((set) => ({
    localStream: null,
    remoteStream: null,
    roomId: null,
    callStatus: "idle",
    filters: defaultFilters,
    currentDomain: 3,

    setLocalStream: (stream) => set({ localStream: stream }),
    setRemoteStream: (stream) => set({ remoteStream: stream }),
    setRoomId: (id) => set({ roomId: id }),
    setCallStatus: (status) => set({ callStatus: status }),
    setFilters: (filters, currentDomain) => set({ filters, currentDomain }),
    reset: () => set({
        localStream: null,
        remoteStream: null,
        roomId: null,
        callStatus: "idle",
        filters: defaultFilters,
        currentDomain: 3
    })
}))