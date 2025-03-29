import React from "react";
import { Toaster } from "sonner";

export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container min-h-screen bg-background dark:bg-background-dark text-foreground dark:text-foreground-dark transition-colors duration-200">
      <main className="flex-1 p-0">
        {children}
        <Toaster />
      </main>
    </div>
  );
};