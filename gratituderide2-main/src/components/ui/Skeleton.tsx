import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-dark/5",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border p-6 space-y-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-dark flex items-center">
      <div className="container-app px-4 space-y-6">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <Skeleton className="h-16 w-full max-w-2xl bg-white/10" />
        <Skeleton className="h-6 w-full max-w-xl bg-white/10" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-40 bg-white/10" />
          <Skeleton className="h-12 w-40 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
