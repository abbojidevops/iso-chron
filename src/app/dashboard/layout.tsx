import { SideNav } from "@/components/layout/SideNav";
import { DashboardAIProvider } from "@/context/DashboardAIContext";
import { DashboardGlobalOverlay } from "@/components/dashboard/DashboardGlobalOverlay";

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
