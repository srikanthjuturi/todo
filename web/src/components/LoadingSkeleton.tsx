export const LoadingSkeleton = () => {
  return (
    <ul aria-busy="true" aria-label="Loading todos">
      {Array.from({ length: 4 }).map((_, i) => (
        <li
          key={i}
          style={{
            height: '64px',
            background: '#e5e7eb',
            borderRadius: '8px',
            marginBottom: '12px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </ul>
  );
};
