"use client";

import { Scale, Plus, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onAddWeight: () => void;
}

export function BottomNav({ onAddWeight }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16 px-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center gap-1 flex-1 py-2",
            pathname === "/dashboard" ? "text-purple-600" : "text-muted-foreground"
          )}
        >
          <Scale className="h-5 w-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>

        <button
          onClick={onAddWeight}
          className="flex flex-col items-center gap-1 flex-1 py-2 -mt-4"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-muted-foreground mt-1">Add</span>
        </button>

        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-1 flex-1 py-2",
            pathname === "/profile" ? "text-purple-600" : "text-muted-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  );
}

