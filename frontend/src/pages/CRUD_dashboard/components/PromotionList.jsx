import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
  DataGrid,
  GridActionsCellItem,
  GridFilterModel,
  GridPaginationModel,
  GridSortModel,
  gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import PageContainer from './PageContainer';
import {
    getManyPromotions,
    deletePromotion,
} from '../data/promotions';

const INITIAL_PAGE_SIZE = 10;

export default function PromotionList() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
      const listData = await getManyPromotions({
        paginationModel,
        filterModel,
        sortModel,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (err) {
      setError(err);
    }

    setIsLoading(false);
  }, [paginationModel,filterModel, sortModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    if (!isLoading) loadData();
  };

  const handleRowClick = React.useCallback(
    ({ row }) => {
      navigate(`/promotions/${row.id}`);
    },
    [navigate],
  );

  const handleCreateClick = () => navigate('/promotions/new');
  const handleRowEdit = (promo) => () => navigate(`/promotions/${promo.id}/edit`);

  const handleRowDelete = (promo) => async () => {
    const confirmed = await dialogs.confirm(
      `Delete promotion "${promo.name}"?`,
      {
        title: 'Delete Promotion',
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      }
    );

    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deletePromotion(promo.id);
      notifications.show('Promotion deleted successfully.', {
        severity: 'success'
      });
      loadData();
    } catch (err) {
      notifications.show(
        `Failed to delete promotion. ${err.message}`,
        { severity: 'error' }
      );
    }
    setIsLoading(false);
  };

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
    }),
    [],
  );

  const columns = React.useMemo(() => [
    { field: 'id', headerName: 'ID', width: 80 },

    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },

    { field: 'description', headerName: 'Description', flex: 2, minWidth: 200 },

    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      valueGetter: ({ value }) => value,
    },

    {
      field: 'minSpending',
      headerName: 'Min Spending',
      width: 150,
      valueFormatter: ({ value }) =>
        value != null ? `$${value.toFixed(2)}` : '-',
    },

    {
      field: 'rate',
      headerName: 'Rate',
      width: 100,
      valueFormatter: ({ value }) =>
        value != null ? `${(value * 100).toFixed(0)}%` : '-',
    },

    {
      field: 'points',
      headerName: 'Points',
      width: 100,
    },

    {
      field: 'startTime',
      headerName: 'Start Time',
      width: 160,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
    },

    {
      field: 'endTime',
      headerName: 'End Time',
      width: 160,
      valueFormatter: ({ value }) => new Date(value).toLocaleDateString(),
    },

    {
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
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={handleRowDelete(row)}
        />,
      ],
    },
  ], []);

  return (
    <PageContainer
      title="Promotions"
      breadcrumbs={[{ title: 'Promotions' }]}
      actions={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Refresh" placement="right">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Button variant="contained" onClick={handleCreateClick} startIcon={<AddIcon />}>
            Create
          </Button>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        {error ? (
          <Alert severity="error">{error.message}</Alert>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            onRowClick={handleRowClick}
            loading={isLoading}
            pageSizeOptions={[5, 10, 25]}
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
