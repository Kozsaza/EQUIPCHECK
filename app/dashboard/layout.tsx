import { Navigation } from "@/components/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="md:pl-64">
        <div className="container mx-auto max-w-6xl px-4 py-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
