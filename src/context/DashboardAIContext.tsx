"use client";

import React, { createContext, useContext, useState } from "react";

interface DashboardAIContextType {
    aiContext: string;
    setAiContext: (context: string) => void;
    handleVoiceCommand: (cmd: string) => void;
}

const DashboardAIContext = createContext<DashboardAIContextType | undefined>(undefined);

export function DashboardAIProvider({ children }: { children: React.ReactNode }) {
    const [aiContext, setAiContext] = useState("System Online. Awaiting simplified commands.");

    const handleVoiceCommand = (cmd: string) => {
        console.log("Global Voice Command:", cmd);
        if (cmd.includes("analyze") || cmd.includes("safety")) {
            setAiContext("Running deep safety analysis across all active modules...");
            // In a real app, this would trigger navigation or global actions
        } else if (cmd.includes("generate")) {
            setAiContext("Navigate to the Molecular Vault to generate a new routine.");
        } else {
            setAiContext(`Heard command: "${cmd}". System processing...`);
        }
    };

    return (
        <DashboardAIContext.Provider value={{ aiContext, setAiContext, handleVoiceCommand }}>
            {children}
        </DashboardAIContext.Provider>
    );
}

export function useDashboardAI() {
    const context = useContext(DashboardAIContext);
    if (!context) {
        throw new Error("useDashboardAI must be used within a DashboardAIProvider");
    }
    return context;
}
