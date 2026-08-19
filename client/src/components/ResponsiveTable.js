import React from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

const ResponsiveTable = ({ 
  columns, 
  data, 
  onSort, 
  sortField, 
  sortDirection = 'asc',
  onRowClick,
  onEdit,
  onDelete,
  loading = false,
  emptyMessage = "No data available"
}) => {
  const handleSort = (columnKey) => {
    if (onSort) {
      const newDirection = sortField === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(columnKey, newDirection);
    }
  };

  const ActionButtons = ({ row }) => (
    <div className="flex items-center space-x-2">
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row);
          }}
          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(row);
          }}
          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  // Add actions column if edit or delete handlers are provided
  const displayColumns = [...columns];
  if (onEdit || onDelete) {
    displayColumns.push({
      key: 'actions',
      label: 'Actions',
      render: (_, row) => <ActionButtons row={row} />,
      sortable: false
    });
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {displayColumns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && sortField === column.key && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={displayColumns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {displayColumns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : (row[column.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Loading...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {data.map((row, index) => (
              <div
                key={row.id || index}
                className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${
                  onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0">
                    <span className="text-sm font-medium text-gray-500">{column.label}:</span>
                    <span className="text-sm text-gray-900 text-right flex-1 ml-4">
                      {column.render ? column.render(row[column.key], row) : (row[column.key] || '-')}
                    </span>
                  </div>
                ))}
                {(onEdit || onDelete) && (
                  <div className="flex justify-end pt-3 mt-3 border-t border-gray-100">
                    <ActionButtons row={row} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTable;
