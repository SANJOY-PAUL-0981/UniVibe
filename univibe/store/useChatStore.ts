import { create } from "zustand";

export type ChatMessage = {
    roomId: string;
  id: string;
  senderId: string;
  message: string;
  createdAt: number;
};

type ChatStore = {
  messages: ChatMessage[];
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    activeRoomId: null,

    setActiveRoomId: (roomId) =>
        set(() => ({
            activeRoomId: roomId,
        })),

    addMessage: (message) =>
        set((state) => ({
            messages: [...state.messages, message],
        })),

    setMessages: (messages) =>
        set(() => ({
            messages,
        })),

    clearMessages: () =>
        set(() => ({
            messages: [],
        })),
}));
