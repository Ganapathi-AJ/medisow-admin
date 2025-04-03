"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Sun, Moon, Menu } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="md:hidden">
            <h1 className="text-xl font-bold">Medisow Admin</h1>
          </div>
          <div className="hidden md:flex">
            <input 
              type="search" 
              placeholder="Search..." 
              className="w-64 rounded-md border border-input bg-background px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* <ThemeToggle /> */}
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-destructive"></span>
            <span className="sr-only">Notifications</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-primary/10">
            <span className="sr-only">Profile</span>
          </div>
        </div>
      </div>
    </header>
  );
} 