import { Navigation } from "@/components/navigation";
import { SessionLinker } from "@/components/session-linker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SessionLinker />
      <main className="md:pl-64">
        <div className="container mx-auto max-w-6xl px-4 py-8 pt-16 md:px-8 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
