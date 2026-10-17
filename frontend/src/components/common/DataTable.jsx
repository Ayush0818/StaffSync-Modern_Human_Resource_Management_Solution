import React from 'react';
import { Table, Spinner } from 'react-bootstrap';

const DataTable = ({ columns = [], data = [], loading = false, emptyMessage = 'No records found' }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="table-custom align-middle mb-0">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={col.width ? { width: col.width } : {}}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-4 text-muted">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DataTable;
