import { SideNav } from "@/components/layout/SideNav";
import { DashboardAIProvider, useDashboardAI } from "@/context/DashboardAIContext";
import { VoiceCommand } from "@/components/voice/VoiceCommand";
import { AIChat } from "@/components/chat/AIChat";

// Inner component to consume context
function DashboardGlobalOverlay() {
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
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardAIProvider>
            <div className="flex h-screen overflow-hidden bg-[#050505]">
                <SideNav />
                <main className="flex-1 overflow-y-auto md:pl-64 transition-all duration-300">
                    <div className="min-h-full p-4 md:p-8">
                        {children}
                    </div>
                </main>
                <DashboardGlobalOverlay />
            </div>
        </DashboardAIProvider>
    );
}
