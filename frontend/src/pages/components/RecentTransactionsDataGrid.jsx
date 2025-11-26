import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../../contexts/AuthContext.jsx';

const columns = [
  { field: 'id', headerName: 'ID', width: 40 },
  { field: 'type', headerName: 'Type', width: 120 },
  { field: 'processedBy', headerName: 'Processed By', width: 150 },
  { field: 'spent', headerName: 'Spent', width: 100 },
  { field: 'earned', headerName: 'Earned', width: 100 },
  { field: 'amount', headerName: 'Amount', width: 100 },
  { field: 'remark', headerName: 'Remark', width: 200 },
];

export default function RecentTransactionsDataGrid() {
  const [rows, setRows] = useState([]);
  const { token } = useAuth();
  const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!token) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/users/me/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('Error fetching transactions:', data.message);
          return;
        }

        const gridRows = data.results.map(t => ({
          id: t.id,
          type: t.type,
          processedBy: t.processedBy || '-',
          spent: t.spent || '-',
          earned: t.earned || '-',
          amount: t.amount || '-',
          remark: t.remark || '-',
        }));

        setRows(gridRows);
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchTransactions();
  }, [token, VITE_BACKEND_URL]);

  return (
    <DataGrid
      sx={{ height: "auto" }}
      rows={rows}
      columns={columns}
      pageSizeOptions={[]}
      pagination={false}
      hideFooter
      hideFooterPagination
      hideFooterSelectedRowCount
      getRowClassName={(params) =>
        params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
      }
      disableColumnResize
      density="compact"
      slotProps={{
        filterPanel: {
          filterFormProps: {
            logicOperatorInputProps: {
              variant: 'outlined',
              size: 'small',
            },
            columnInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            operatorInputProps: {
              variant: 'outlined',
              size: 'small',
              sx: { mt: 'auto' },
            },
            valueInputProps: {
              InputComponentProps: {
                variant: 'outlined',
                size: 'small',
              },
            },
          },
        },
      }}
    />
  );
}
