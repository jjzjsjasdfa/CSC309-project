import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useAuth } from '../../../contexts/AuthContext';
import { getOne, setSuspicious, processRedemption } from '../data/transactions';
import useNotifications from '../hooks/useNotifications/useNotifications';
import PageContainer from './PageContainer';

export default function TransactionShow() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const { currentUser } = useAuth();
  
  const [transaction, setTransaction] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const isManager = ['manager', 'superuser'].includes(currentUser?.role);
  const isCashier = ['cashier', 'manager', 'superuser'].includes(currentUser?.role);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOne(transactionId);
      setTransaction(data);
    } catch (err) { setError(err); }
    setLoading(false);
  }, [transactionId]);

  React.useEffect(() => { loadData(); }, [loadData]);

  const handleSuspiciousToggle = async () => {
    try {
      await setSuspicious(transaction.id, !transaction.suspicious);
      notifications.show(`Transaction marked as ${!transaction.suspicious ? 'suspicious' : 'safe'}`, { severity: 'success' });
      loadData();
    } catch (err) {
      notifications.show(`Failed: ${err.message}`, { severity: 'error' });
    }
  };

  const handleProcessRedemption = async () => {
    try {
      await processRedemption(transaction.id);
      notifications.show('Redemption processed', { severity: 'success' });
      loadData();
    } catch (err) {
      notifications.show(`Failed: ${err.message}`, { severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  if (!transaction) return null;

  return (
    <PageContainer title={`Transaction #${transaction.id}`} breadcrumbs={[{ title: 'Transactions', path: '/transactions' }, { title: `#${transaction.id}` }]}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}><Typography variant="overline">Type</Typography><Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{transaction.type}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="overline">User</Typography><Typography variant="h6">{transaction.utorid}</Typography></Grid>
          
          {transaction.spent && (
            <Grid item xs={12} sm={6}><Typography variant="overline">Spent</Typography><Typography variant="h6">${transaction.spent}</Typography></Grid>
          )}
          
          <Grid item xs={12} sm={6}>
            <Typography variant="overline">Points Amount</Typography>
            <Typography variant="h6" color={transaction.amount < 0 ? 'error' : 'success'}>{transaction.amount}</Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="overline">Status</Typography>
            <Box>
              {transaction.suspicious && <Chip icon={<WarningIcon />} label="Suspicious" color="error" sx={{ mr: 1 }} />}
              {transaction.type === 'redemption' && (
                 transaction.processedBy ? <Chip icon={<CheckCircleIcon />} label="Processed" color="success" /> : <Chip label="Pending Process" color="warning" />
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="overline">Remark</Typography>
            <Typography variant="body1">{transaction.remark || 'None'}</Typography>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/transactions')}>Back</Button>
          
          {isManager && (
            <Button variant="contained" color={transaction.suspicious ? 'success' : 'warning'} onClick={handleSuspiciousToggle}>
              {transaction.suspicious ? 'Mark as Safe' : 'Mark as Suspicious'}
            </Button>
          )}

          {isCashier && transaction.type === 'redemption' && !transaction.processedBy && (
            <Button variant="contained" color="primary" onClick={handleProcessRedemption}>
              Process Redemption
            </Button>
          )}
        </Stack>
      </Paper>
    </PageContainer>
  );
}