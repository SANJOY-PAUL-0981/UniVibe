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
  unreadCount: number;
  setActiveRoomId: (roomId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  incrementUnread: () => void;
  resetUnread: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  activeRoomId: null,
  unreadCount: 0,

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

  incrementUnread: () =>
    set((state) => ({
      unreadCount: state.unreadCount + 1,
    })),

  resetUnread: () =>
    set(() => ({
      unreadCount: 0,
    })),
}));
