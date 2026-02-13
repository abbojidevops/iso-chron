"use client";

import { useDashboardAI } from "@/context/DashboardAIContext";
import { VoiceCommand } from "@/components/voice/VoiceCommand";
import { AIChat } from "@/components/chat/AIChat";

export function DashboardGlobalOverlay() {
    const { aiContext, handleVoiceCommand } = useDashboardAI();
    return (
        <>
            {/* Voice and Chat Temporarily Disabled per User Request */}
            {/* <div className="fixed bottom-6 left-6 z-50">
                <VoiceCommand onCommand={handleVoiceCommand} />
            </div>
            <AIChat context={aiContext} /> */}
        </>
    );
}
