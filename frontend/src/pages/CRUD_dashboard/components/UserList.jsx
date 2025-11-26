import * as React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import PageContainer from './PageContainer';
import {
    getMany,
} from '../data/users';
import ColorModeIconDropdown from "../../../shared-theme/ColorModeIconDropdown";

const INITIAL_PAGE_SIZE = 10;

export default function UserList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isManager = ['manager', 'superuser'].includes(currentUser?.role);

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = React.useState({
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 0,
    pageSize: searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = React.useState(
    searchParams.get('filter')
      ? JSON.parse(searchParams.get('filter') ?? '')
      : { items: [] },
  );
  const [sortModel, setSortModel] = React.useState(
    searchParams.get('sort') ? JSON.parse(searchParams.get('sort') ?? '') : [],
  );

  const [rowsState, setRowsState] = React.useState({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handlePaginationModelChange = React.useCallback(
    (model) => {
      setPaginationModel(model);

      searchParams.set('page', String(model.page));
      searchParams.set('pageSize', String(model.pageSize));

      const qs = searchParams.toString();
      navigate(`${pathname}${qs ? '?' : ''}${qs}`);
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model) => {
      setFilterModel(model);

      if (model.items.length > 0) {
        searchParams.set('filter', JSON.stringify(model));
      } else {
        searchParams.delete('filter');
      }

      const qs = searchParams.toString();
      navigate(`${pathname}${qs ? '?' : ''}${qs}`);
    },
    [navigate, pathname, searchParams],
  );

  const handleSortModelChange = React.useCallback(
    (model) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set('sort', JSON.stringify(model));
      } else {
        searchParams.delete('sort');
      }

      const qs = searchParams.toString();
      navigate(`${pathname}${qs ? '?' : ''}${qs}`);
    },
    [navigate, pathname, searchParams],
  );

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
        const listData = await getMany();
        setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
        });
    } catch (err) {
        setError(err);
    }

    setIsLoading(false);
    }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    if (!isLoading) loadData();
  };

  const handleRowClick = React.useCallback(
    ({ row }) => {
      navigate(`/users/${row.id}`);
    },
    [navigate],
  );

  const handleCreateClick = () => navigate('/users/new');
  const handleRowEdit = (promo) => () => navigate(`/users/${promo.id}/edit`);

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const dateTimeFormatter = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  }

  const dateFormatter = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString();
  };

  const columns = React.useMemo(() => {
    const baseColumns = [
      { field: 'id', headerName: 'ID', flex: 1, minWidth: 50, type: 'number' },
      { field: 'utorid', headerName: 'Utorid', flex: 1, minWidth: 120, type: 'string' },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 150, type: 'string' },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 250, type: 'string' },
      { field: 'birthday', headerName: 'Birthday', minWidth: 130, type: 'date', valueFormatter: dateFormatter },
      { field: 'role', headerName: 'Role', flex: 1, minWidth: 120, type: 'string' },
      { field: 'points', headerName: 'Points', flex: 1, minWidth: 80, type: 'number' },
      { field: 'createdAt', headerName: 'CreatedAt', flex: 1, minWidth: 160, type: 'dateTime', valueFormatter: dateTimeFormatter },
      { field: 'lastLogin', headerName: 'LastLogin', flex: 1, minWidth: 160, type: 'dateTime', valueFormatter: dateTimeFormatter },
      { field: 'verified', headerName: 'Verified', flex: 1, minWidth: 80, type: 'boolean' },
      { field: 'avatarUrl', headerName: 'AvatarUrl', flex: 1, minWidth: 200, type: 'string' },
    ];

    if (isManager) {
    baseColumns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={handleRowEdit(row)}
        />,
      ],
    });
  }
  return baseColumns;}, [isManager, handleRowEdit]);

  return (
    <PageContainer
      title="Users"
      breadcrumbs={[{ title: 'Users' }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Refresh" placement="right">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        {isManager && (
          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            Create
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
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            sortingMode="client"
            filterMode="client"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            onRowClick={handleRowClick}
            loading={isLoading}
            pageSizeOptions={[5, 10, 25]}
            showToolbar
            disableRowSelectionOnClick
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: 'transparent',
              },
              [`& .${gridClasses.row}:hover`]: {
                cursor: 'pointer',
              },
            }}
          />
        )}
      </Box>
    </PageContainer>
  );
}
