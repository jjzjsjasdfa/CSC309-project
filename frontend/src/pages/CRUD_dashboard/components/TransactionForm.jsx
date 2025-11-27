import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

const shouldShowField = (type, fieldName) => {
  if (!type) return false;
  const config = {
    purchase: ['utorid', 'spent', 'remark'],
    adjustment: ['utorid', 'amount', 'relatedId', 'remark'],
    transfer: ['recipientId', 'amount', 'remark'],
    redemption: ['amount', 'remark'],
  };
  return config[type]?.includes(fieldName);
};

export default function TransactionForm({
  formState,
  onFieldChange,
  onSubmit,
  submitButtonLabel,
  backButtonPath,
}) {
  const formValues = formState.values || {};
  const formErrors = formState.errors || {};
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      try { await onSubmit(formValues); } finally { setIsSubmitting(false); }
    }, [formValues, onSubmit]);

  const handleChange = (event) => onFieldChange(event.target.name, event.target.value);
  
  const handleNumberChange = (event) => {
    const val = event.target.value;
    const num = val === '' ? null : Number(val);
    onFieldChange(event.target.name, num);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!formErrors.type} sx={{ minWidth: '200px' }}>
            <InputLabel id="tx-type-label">Transaction Type</InputLabel>
            <Select
              labelId="tx-type-label"
              name="type"
              label="Transaction Type"
              value={formValues.type || ''}
              onChange={handleChange}
            >
              <MenuItem value="purchase">Purchase (Cashier)</MenuItem>
              <MenuItem value="adjustment">Adjustment (Manager)</MenuItem>
              <MenuItem value="transfer">Transfer (User)</MenuItem>
              <MenuItem value="redemption">Redemption (User)</MenuItem>
            </Select>
            <FormHelperText>{formErrors.type}</FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} />
        {shouldShowField(formValues.type, 'utorid') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="utorid"
              label="Customer/Target UTORID"
              value={formValues.utorid || ''}
              onChange={handleChange}
              error={!!formErrors.utorid}
              helperText={formErrors.utorid}
              fullWidth
            />
          </Grid>
        )}

        {shouldShowField(formValues.type, 'recipientId') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="recipientId"
              label="Recipient UTORID (User ID)"
              value={formValues.recipientId || ''}
              onChange={handleChange}
              error={!!formErrors.recipientId}
              helperText={formErrors.recipientId}
              fullWidth
            />
          </Grid>
        )}

        {/* spent, only for purchase */}
        {shouldShowField(formValues.type, 'spent') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="spent"
              label="Amount Spent ($)"
              type="number"
              value={formValues.spent || ''}
              onChange={handleNumberChange}
              error={!!formErrors.spent}
              helperText={formErrors.spent}
              fullWidth
            />
          </Grid>
        )}

        {/* amount, for adjustment, transfer, redemption */}
        {shouldShowField(formValues.type, 'amount') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="amount"
              label="Points Amount"
              type="number"
              value={formValues.amount || ''}
              onChange={handleNumberChange}
              error={!!formErrors.amount}
              helperText={formErrors.amount}
              fullWidth
            />
          </Grid>
        )}

        {/* Related ID, for adjustment */}
        {shouldShowField(formValues.type, 'relatedId') && (
          <Grid item xs={12} sm={6}>
            <TextField
              name="relatedId"
              label="Related Transaction ID"
              type="number"
              value={formValues.relatedId || ''}
              onChange={handleNumberChange}
              error={!!formErrors.relatedId}
              helperText={formErrors.relatedId}
              fullWidth
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            name="remark"
            label="Remark (Optional)"
            value={formValues.remark || ''}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
          />
        </Grid>

      </Grid>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(backButtonPath || '/transactions')}>
          Back
        </Button>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ minWidth: 120 }}>
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}