import React from 'react';
import { Eye } from 'lucide-react';

export function Logo({ className = 'h-12' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="aspect-square h-full rounded-lg bg-primary/10 flex items-center justify-center shadow-sm">
        <Eye className="h-1/2 w-1/2 text-primary" aria-hidden="true" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-foreground font-bold text-lg tracking-tight">VISION</span>
        <span className="text-primary font-bold text-lg tracking-tight">TENDERS</span>
      </div>
    </div>
  );
}
