import * as React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  getOne as getUser,
} from '../data/users';
import PageContainer from './PageContainer';

export default function UserShow() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { currentUser } = useAuth();
  const isManager = ['manager', 'superuser'].includes(currentUser?.role);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const showData = await getUser(Number(userId));
      setUser(showData);
    } catch (showDataError) {
      setError(showDataError);
    }
    setIsLoading(false);
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserEdit = React.useCallback(() => {
    navigate(`/users/${userId}/edit`);
  }, [navigate, userId]);

  const handleBack = React.useCallback(() => {
    navigate('/users');
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

    if (!user) return null;

    return (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {/* ID */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">ID</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.id}
              </Typography>
            </Paper>
          </Grid>

          {/* UTORID */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Utorid</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.utorid}
              </Typography>
            </Paper>
          </Grid>

          {/* Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.name}
              </Typography>
            </Paper>
          </Grid>

          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
            </Paper>
          </Grid>

          {/* Birthday */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Birthday</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.birthday ?? "-" }
              </Typography>
            </Paper>
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Role</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.role}
              </Typography>
            </Paper>
          </Grid>

          {/* Points */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Points</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.points}
              </Typography>
            </Paper>
          </Grid>

          {/* Created At */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Created At</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.createdAt ?? "—"}
              </Typography>
            </Paper>
          </Grid>

          {/* Last Login */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Last Login</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.lastLogin ?? "—"}2
              </Typography>
            </Paper>
          </Grid>

          {/* Verified */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Verified</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.verified ? "Yes" : "No"}
              </Typography>
            </Paper>
          </Grid>

          {/* Avatar URL */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Avatar URL</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {user.avatarUrl ?? "—"}
              </Typography>
            </Paper>
          </Grid>

          {/* Promotions */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Promotions</Typography>

              {user.promotions && user.promotions.length > 0 ? (
                user.promotions.map((promo) => (
                  <Box key={promo.id} sx={{ mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {promo.name}
                    </Typography>
                    <Typography variant="body2">
                      Min Spending: {promo.minSpending ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                      Rate: {promo.rate ?? "—"}
                    </Typography>
                    <Typography variant="body2">
                      Points: {promo.points ?? "—"}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body1">—</Typography>
              )}
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
          {isManager && (
            <Stack direction="row" spacing={2}>
                <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleUserEdit}
                >
                Edit
                </Button>
            </Stack>
          )}
            </Stack>
      </Box>
    );
  }, [
    isLoading,
    error,
    user,
    handleBack,
    handleUserEdit,
    isManager
  ]);

  const pageTitle = `User ${userId}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Users', path: '/users' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>
    </PageContainer>
  );
}
