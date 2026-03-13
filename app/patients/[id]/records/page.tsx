"use client";

// app/patients/[id]/records/page.tsx
// Página dedicada para visualização de registros do paciente.
// Renderiza PatientRecords com providers necessários.

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ThemeProvider,
  NavigationProvider,
} from "@/lib/contexts";
import { QueryProvider } from "@/lib/query-provider";
import Navbar from "@/components/Navbar";
import PatientRecords from "@/components/admin/PatientRecords";
import { cn } from "@/lib/utils";

export default function PatientRecordsPage() {
  const params = useParams<{ id: string }>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryProvider>
      <ThemeProvider>
        <NavigationProvider defaultPage="patients">
          <Navbar
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          <main
            className={cn(
              "min-h-screen",
              "pt-16 lg:pt-20",
              "pb-20 lg:pb-6",
              "px-4 sm:px-6 lg:px-8",
            )}
          >
            <div className="mx-auto max-w-6xl py-6">
              <PatientRecords patientId={params.id} />
            </div>
          </main>
        </NavigationProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
