interface SkeletonLoaderProps {
  rows?: number;
  cols?: number;
}

export function SkeletonLoader({ rows = 5, cols = 6 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr
          key={rowIdx}
          className="animate-pulse border-b border-border"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} className="px-4 py-4">
              <div
                className={`h-4 rounded bg-muted ${
                  colIdx === 0 ? 'w-40' : colIdx === 2 ? 'w-64' : 'w-20'
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
