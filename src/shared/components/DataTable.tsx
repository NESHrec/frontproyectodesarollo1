import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  caption: string;
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
};

export function DataTable<T>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyMessage = "No hay registros para mostrar.",
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#62727B]/15 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#DDF3F1] text-[#62727B]">
          <tr>
            {columns.map((column) => (
              <th className={`whitespace-nowrap px-4 py-3 font-bold ${column.className ?? ""}`} key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#62727B]/10">
          {rows.length ? rows.map((row) => (
            <tr className="align-top transition hover:bg-[#FBFCFA]" key={getRowKey(row)}>
              {columns.map((column) => (
                <td className={`px-4 py-4 text-[#62727B] ${column.className ?? ""}`} key={column.key}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td className="px-4 py-8 text-center text-[#62727B]/70" colSpan={columns.length}>{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
