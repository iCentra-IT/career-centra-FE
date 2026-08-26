export function EmptyTableState({
  columns,
  message,
}: {
  columns: string[];
  message: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400">
            {columns.map((col) => (
              <th key={col} className="pb-3 pr-4 font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <p className="py-6 text-center text-xs text-gray-400">{message}</p>
    </div>
  );
}
