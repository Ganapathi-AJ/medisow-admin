"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "../components/theme-provider";
import { FirebaseProvider } from "./context/firebase-context";
import { NextUIProvider } from "@nextui-org/react";
import { Toaster } from "./components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <NextUIProvider>
          {children}
          <Toaster />
        </NextUIProvider>
      </ThemeProvider>
    </FirebaseProvider>
  );
} 