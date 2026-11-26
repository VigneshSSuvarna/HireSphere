export function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-[6px] bg-subtle border border-hairline opacity-70"
        />
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-[8px] bg-subtle border border-hairline opacity-70"
        />
      ))}
    </div>
  );
}
