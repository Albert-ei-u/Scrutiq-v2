"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-scrutiq-bg space-y-4">
        <RefreshCcw className="size-10 text-scrutiq-blue animate-spin" />
        <p className="text-xs font-black text-scrutiq-muted uppercase tracking-widest">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
