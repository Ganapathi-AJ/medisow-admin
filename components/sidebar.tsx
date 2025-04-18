"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Pill,
  FileText,
  Droplet,
  LayoutDashboard,
  Ticket,
  Bell,
} from "lucide-react";

// Navigation items with nested items
const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Medicines",
    href: "/medicines",
    icon: <Pill className="h-5 w-5" />,
    // submenu: [
    //   {
    //     title: "Categories",
    //     href: "/medicines/categories",
    //   },
    //   {
    //     title: "Sub Categories",
    //     href: "/medicines/subcategories",
    //   },
    //   {
    //     title: "Medicines List",
    //     href: "/medicines/list",
    //   },
    // ],
  },
  {
    title: "Prescriptions",
    href: "/prescriptions",
    icon: <FileText className="h-5 w-5" />,
    // submenu: [
    //   {
    //     title: "Categories",
    //     href: "/prescriptions/categories",
    //   },
    //   {
    //     title: "Prescriptions List",
    //     href: "/prescriptions/list",
    //   },
    // ],
  },
  {
    title: "Lab Reports",
    href: "/lab-reports",
    icon: <FileText className="h-5 w-5" />,
    // submenu: [
    //   {
    //     title: "Categories",
    //     href: "/lab-reports/categories",
    //   },
    //   {
    //     title: "Reports List",
    //     href: "/lab-reports/list",
    //   },
    // ],
  },
  {
    title: "Donors",
    href: "/donors",
    icon: <Droplet className="h-5 w-5" />,
  },
  {
    title: "Vouchers",
    href: "/vouchers",
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: <Bell className="h-5 w-5" />,
  }
];

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ isMobileMenuOpen = false, setIsMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Toggle submenu open/closed
  const toggleSubmenu = (title: string) => {
    if (openSubmenu === title) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(title);
    }
  };

  // Handle link click in mobile view
  const handleLinkClick = () => {
    if (setIsMobileMenuOpen && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 border-r bg-background transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:flex md:flex-col`}>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl" onClick={handleLinkClick}>
          Medisow Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${pathname === item.href ? "bg-accent text-accent-foreground" : ""
                  }`}
                onClick={handleLinkClick}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          © Medisow {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
} 