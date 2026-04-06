export const LoadingSkeleton = () => {
  return (
    <ul aria-busy="true" aria-label="Loading todos" className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          className="h-16 animate-pulse rounded-xl bg-muted"
        />
      ))}
    </ul>
  );
};
