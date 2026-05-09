import { create } from "zustand";

type Filters = {
  filterByGender: boolean;
  filterGenderData: string;
  filterByCollege: boolean;
  filterCollegeData: string;
  filterByYear: boolean;
  filterYearData: string;
  filterByFieldOfStudy: boolean;
  filterFieldOfStudyData: string;
};

type CallStatus = "idle" | "waiting" | "connected" | "ended";

type CallStore = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteProfile: {
    id?: string;
    username?: string;
    profilePicture?: string | null;
  } | null;
  roomId: string | null;
  callStatus: CallStatus;
  filters: Filters;
  currentDomain: number;

  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  setRemoteProfile: (
    p: {
      id?: string;
      username?: string;
      profilePicture?: string | null;
    } | null,
  ) => void;
  setRoomId: (id: string | null) => void;
  setCallStatus: (status: CallStatus) => void;
  setFilters: (filters: Filters, currentDomain: number) => void;
  reset: () => void;
};

const defaultFilters: Filters = {
  filterByGender: false,
  filterGenderData: "",
  filterByCollege: false,
  filterCollegeData: "",
  filterByYear: false,
  filterYearData: "",
  filterByFieldOfStudy: false,
  filterFieldOfStudyData: "",
};

export const useCallStore = create<CallStore>((set) => ({
  localStream: null,
  remoteStream: null,
  remoteProfile: null,
  roomId: null,
  callStatus: "idle",
  filters: defaultFilters,
  currentDomain: 3,

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  setRemoteProfile: (p) => set({ remoteProfile: p }),
  setRoomId: (id) => set({ roomId: id }),
  setCallStatus: (status) => set({ callStatus: status }),
  setFilters: (filters, currentDomain) => set({ filters, currentDomain }),
  reset: () => {
    const { localStream } = useCallStore.getState();
    localStream?.getTracks().forEach((track) => track.stop());
    set({
      localStream: null,
      remoteStream: null,
      remoteProfile: null,
      roomId: null,
      callStatus: "idle",
      filters: defaultFilters,
      currentDomain: 3,
    });
  },
}));
