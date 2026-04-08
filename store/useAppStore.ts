import { create } from "zustand";
import { Participant } from "@/lib/scoring";

export type CuisineType =
  | "고기"
  | "회/해산물"
  | "한식"
  | "일식"
  | "중식"
  | "양식"
  | "분식"
  | "상관없음";

export interface Conditions {
  budget: number; // 1인당 예산 (원)
  cuisines: CuisineType[];
  needRoom: boolean;
  minSeats: number;
}

interface AppStore {
  participants: Participant[];
  conditions: Conditions;
  step: "participants" | "conditions" | "result";

  addParticipant: (p: Participant) => void;
  removeParticipant: (index: number) => void;
  setConditions: (c: Conditions) => void;
  setStep: (s: AppStore["step"]) => void;
  reset: () => void;
}

const defaultConditions: Conditions = {
  budget: 50000,
  cuisines: ["상관없음"],
  needRoom: false,
  minSeats: 0,
};

export const useAppStore = create<AppStore>((set) => ({
  participants: [],
  conditions: defaultConditions,
  step: "participants",

  addParticipant: (p) =>
    set((s) => ({ participants: [...s.participants, p] })),

  removeParticipant: (index) =>
    set((s) => ({
      participants: s.participants.filter((_, i) => i !== index),
    })),

  setConditions: (c) => set({ conditions: c }),
  setStep: (step) => set({ step }),
  reset: () =>
    set({ participants: [], conditions: defaultConditions, step: "participants" }),
}));
