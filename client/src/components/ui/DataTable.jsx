import { PencilLine, Trash2 } from "lucide-react";

import EmptyState from "./EmptyState";

const DataTable = ({ columns, rows, onEdit, onDelete, emptyTitle, emptyDescription }) => {
  const showActions = Boolean(onEdit || onDelete);

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[24px] border border-brand-100/80 bg-white/95 shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100/60">
            <thead className="bg-gradient-to-r from-brand-50/70 via-stone-50/80 to-brand-50/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500"
                  >
                    {column.label}
                  </th>
                ))}
                {showActions ? (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-[0.22em] text-stone-500">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100/40 bg-white/90">
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="group align-top transition-colors duration-150 hover:bg-brand-50/40"
                >
                  {columns.map((column) => (
                    <td
                      key={`${row._id}-${column.key}`}
                      className="px-5 py-4 text-sm font-medium text-stone-700"
                    >
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                  {showActions ? (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            title="Edit"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-stone-200/90 bg-white text-stone-500 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 hover:scale-105"
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            title="Delete"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-rose-200/90 bg-white text-rose-500 shadow-sm transition hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 hover:scale-105"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-3.5 md:hidden">
        {rows.map((row) => (
          <div
            key={row._id}
            className="glass-panel relative overflow-hidden p-4 shadow-sm"
          >
            <div className="space-y-2.5">
              {columns.slice(0, 4).map((column) => (
                <div
                  key={`${row._id}-${column.key}`}
                  className="flex items-start justify-between gap-3 border-b border-brand-100/40 pb-2 text-xs"
                >
                  <span className="font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {column.label}
                  </span>
                  <div className="text-right font-medium text-stone-800">
                    {column.render ? column.render(row) : row[column.key] || "-"}
                  </div>
                </div>
              ))}
            </div>
            {showActions ? (
              <div className="mt-3 flex gap-2 pt-1">
                {onEdit ? (
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="btn-secondary flex-1 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="flex-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;
