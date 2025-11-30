import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';

import { useAuth } from '../../../contexts/AuthContext';
import { getMany } from '../data/transactions';
import PageContainer from './PageContainer';
import ColorModeIconDropdown from "../../../shared-theme/ColorModeIconDropdown";

export default function TransactionList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const isManager = ['manager', 'superuser'].includes(currentUser?.role);
  const canCreate = ['regular', 'cashier', 'manager', 'superuser'].includes(currentUser?.role);

  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMany(currentUser.role);
      setRows(data.items || []);
    } catch (err) {
      console.error(err);
      setError(err);
    }
    setIsLoading(false);
  }, [currentUser.role]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const columns = React.useMemo(() => {
    const cols = [
        { field: 'id', headerName: 'ID', width: 70 },
        
        { 
        field: 'type', 
        headerName: 'Type', 
        width: 130,
        renderCell: (params) => (
            <Chip 
            label={params.value} 
            color="primary" 
            variant="outlined" 
            size="small" 
            sx={{ textTransform: 'capitalize' }} 
            />
        )
        },

        { field: 'utorid', headerName: 'User', width: 120 },

        { 
        field: 'spent', 
        headerName: 'Spent', 
        width: 100,
        valueFormatter: (value) => {
            if (value == null) return '-';
            return `$${Number(value).toFixed(2)}`;
        }
        },

        { 
        field: 'amount', 
        headerName: 'Points', 
        width: 120,
        renderCell: (params) => {
            let value = params.row.amount ?? params.row.earned;
            
            if (value == null) return '-';

            if (params.row.type === 'redemption') {
                value = -Math.abs(value);
            }

            return (
            <Box sx={{ 
                color: value < 0 ? 'error.main' : 'success.main', 
                fontWeight: 'bold' 
            }}>
                {value > 0 ? '+' : ''}{value}
            </Box>
            );
        }
        },

        { 
        field: 'createdAt', 
        headerName: 'Date', 
        width: 180,
        valueFormatter: (value) => {
            if (!value) return '-';
            return new Date(value).toLocaleString();
        }
        },
    ];

    if (isManager) {
        cols.push({ 
            field: 'suspicious', 
            headerName: 'Suspicious', 
            width: 100,
            type: 'boolean'
        });

        cols.push({
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 80,
            getActions: ({ row }) => [
                <GridActionsCellItem
                    key="view"
                    icon={<VisibilityIcon />}
                    label="View"
                    onClick={() => navigate(`/transactions/${row.id}`)}
                />
            ]
        });
    }

    return cols;
  }, [navigate, isManager]);

  return (
    <PageContainer
      title="Transactions"
      breadcrumbs={[{ title: 'Transactions' }]}
      actions={
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {canCreate && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={() => navigate('/transactions/new')}
            >
              New Transaction
            </Button>
          )}
        </Stack>
      }
    >
      <Box sx={{ position: 'fixed', top: '0.75rem', right: '2.25rem', zIndex: 1000 }}>
        <ColorModeIconDropdown />
      </Box>
      
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">
            {error.message || "Failed to load transactions."}
          </Alert>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            autoHeight
            initialState={{ 
              pagination: { paginationModel: { pageSize: 10 } },
              sorting: { sortModel: [{ field: 'id', sort: 'desc' }] }
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
          />
        )}
      </Box>
    </PageContainer>
  );
}