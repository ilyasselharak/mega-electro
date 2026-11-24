"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** URL-synced, debounced search field for admin tables. */
export function SearchInput({ placeholder = "Rechercher…", param = "q" }: { placeholder?: string; param?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(sp.get(param) ?? "");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (value === (sp.get(param) ?? "")) return;
    const t = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (value) next.set(param, value);
      else next.delete(param);
      next.delete("page");
      start(() => router.replace(`${pathname}?${next}`));
    }, 300);
    return () => clearTimeout(t);
  }, [value, sp, param, pathname, router]);

  return (
    <div className="relative w-full sm:w-72">
      {pending ? <Loader2 className="absolute start-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" /> : <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />}
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="h-9 bg-background ps-9" />
    </div>
  );
}
