import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  deleteOne as deletePromotion,
  getOne as getPromotion,
} from '../data/promotions';
import PageContainer from './PageContainer';

export default function PromotionShow() {
  const { promotionId } = useParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [promotion, setPromotion] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getPromotion(Number(promotionId));
      setPromotion(showData);
    } catch (showDataError) {
      setError(showDataError);
    }
    setIsLoading(false);
  }, [promotionId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePromotionEdit = React.useCallback(() => {
    navigate(`/promotions/${promotionId}/edit`);
  }, [navigate, promotionId]);

  const handlePromotionDelete = React.useCallback(async () => {
    if (!promotion) return;

    const confirmed = await dialogs.confirm(
      `Do you wish to delete "${promotion.name}"?`,
      {
        title: 'Delete promotion?',
        severity: 'error',
        okText: 'Delete',
        cancelText: 'Cancel',
      },
    );

    if (confirmed) {
      setIsLoading(true);
      try {
        await deletePromotion(Number(promotionId));

        navigate('/promotions');

        notifications.show('Promotion deleted successfully.', {
          severity: 'success',
          autoHideDuration: 3000,
        });
      } catch (deleteError) {
        notifications.show(
          `Failed to delete promotion. Reason: ${deleteError.message}`,
          {
            severity: 'error',
            autoHideDuration: 3000,
          },
        );
      }
      setIsLoading(false);
    }
  }, [promotion, dialogs, promotionId, navigate, notifications]);

  const handleBack = React.useCallback(() => {
    navigate('/promotions');
  }, [navigate]);

  const renderShow = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ flexGrow: 1 }}>
          <Alert severity="error">{error.message}</Alert>
        </Box>
      );
    }

    if (!promotion) return null;

    const start = promotion.startTime
      ? dayjs(promotion.startTime).format('MMMM D, YYYY')
      : '-';
    const end = promotion.endTime
      ? dayjs(promotion.endTime).format('MMMM D, YYYY')
      : '-';

    return (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.name}
              </Typography>
            </Paper>
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Type</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.type === 'automatic' ? 'Automatic' : promotion.type}
              </Typography>
            </Paper>
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Description</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.description || '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Start / End */}
          <Grid item xs={12} sm={6}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Start date</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {start}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">End date</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {end}
              </Typography>
            </Paper>
          </Grid>

          {/* Min spending */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Min spending</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.minSpending != null
                  ? `$${promotion.minSpending.toFixed(2)}`
                  : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Rate */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Rate</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.rate != null
                  ? `${(promotion.rate * 100).toFixed(0)}%`
                  : '-'}
              </Typography>
            </Paper>
          </Grid>

          {/* Points */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Points</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {promotion.points != null ? promotion.points : '-'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handlePromotionEdit}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handlePromotionDelete}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }, [
    isLoading,
    error,
    promotion,
    handleBack,
    handlePromotionEdit,
    handlePromotionDelete,
  ]);

  const pageTitle = `Promotion ${promotionId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Promotions', path: '/promotions' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
