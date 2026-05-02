import React from 'react';
import '../styles/components.css';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className='table-container'>
      <table className='table'>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ maxWidth: column.maxWidth || 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className='text-center'>
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className='table-row' onClick={() => onRowClick && onRowClick(row)}>
                {columns.map((column) => (
                  <td key={column.key} style={{ maxWidth: column.maxWidth || 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', title: String(row[column.key] || '') }}>{row[column.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
