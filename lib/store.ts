import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuditFormData, ToolEntry, UseCase } from "./types";

interface FormStore {
  formData: AuditFormData;
  addTool: (tool: ToolEntry) => void;
  removeTool: (toolId: string) => void;
  updateTool: (toolId: string, updates: Partial<ToolEntry>) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  reset: () => void;
}

const defaultFormData: AuditFormData = {
  tools: [],
  teamSize: 5,
  useCase: "mixed",
};

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      addTool: (tool) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: [...state.formData.tools.filter((t) => t.toolId !== tool.toolId), tool],
          },
        })),
      removeTool: (toolId) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.filter((t) => t.toolId !== toolId),
          },
        })),
      updateTool: (toolId, updates) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tools: state.formData.tools.map((t) =>
              t.toolId === toolId ? { ...t, ...updates } : t
            ),
          },
        })),
      setTeamSize: (teamSize) =>
        set((state) => ({ formData: { ...state.formData, teamSize } })),
      setUseCase: (useCase) =>
        set((state) => ({ formData: { ...state.formData, useCase } })),
      reset: () => set({ formData: defaultFormData }),
    }),
    {
      name: "ai-audit-form",
    }
  )
);
