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
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useAuth } from '../../../contexts/AuthContext';
import { getMany as getPromotions } from '../data/promotions';

const shouldShowField = (type, fieldName) => {
    if (!type) return false;
    const config = {
        purchase: ['utorid', 'spent', 'remark', 'promotionIds'],
        adjustment: ['utorid', 'amount', 'relatedId', 'remark', 'promotionIds'],
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
    const { currentUser } = useAuth();
    const formValues = formState.values || {};
    const formErrors = formState.errors || {};
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [availablePromotions, setAvailablePromotions] = React.useState([]);

    React.useEffect(() => {
        const loadPromotions = async () => {
        try {
            const data = await getPromotions();
            setAvailablePromotions(data.items || []);
        } catch (err) {
            console.error("Failed to load promotions", err);
        }
        };
        loadPromotions();
    }, []);

    console.log("Current User Role:", currentUser?.role);

    const role = currentUser?.role;
    const isCashier = ['cashier', 'manager', 'superuser'].includes(role);
    const isManager = ['manager', 'superuser'].includes(role);

    const handleSubmit = React.useCallback(async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        try { await onSubmit(formValues); } finally { setIsSubmitting(false); }
    }, [formValues, onSubmit]);

    const handleChange = (e) => onFieldChange(e.target.name, e.target.value);
  
    const handleNumberChange = (e) => {
        const val = e.target.value;
        const num = val === '' ? null : Number(val);
        onFieldChange(e.target.name, num);
    };

    const handlePromotionChange = (event) => {
        const { target: { value },} = event;
        const val = typeof value === 'string' ? value.split(',') : value;
        onFieldChange('promotionIds', val);
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
              <MenuItem value="transfer">Transfer (User)</MenuItem>
              <MenuItem value="redemption">Redemption (User)</MenuItem>
              {isCashier && <MenuItem value="purchase">Purchase (Cashier)</MenuItem>}
              {isManager && <MenuItem value="adjustment">Adjustment (Manager)</MenuItem>}
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
              label="Recipient User ID"
              type="number"
              value={formValues.recipientId || ''}
              onChange={handleNumberChange}
              error={!!formErrors.recipientId}
              helperText={formErrors.recipientId || "Enter the numeric User ID (e.g. 5)"}
              fullWidth
            />
          </Grid>
        )}

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

        {shouldShowField(formValues.type, 'promotionIds') && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="promo-select-label">Apply Promotions</InputLabel>
              <Select
                labelId="promo-select-label"
                id="promo-select"
                multiple
                value={formValues.promotionIds || []}
                onChange={handlePromotionChange}
                input={<OutlinedInput label="Apply Promotions" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const promo = availablePromotions.find(p => p.id === value);
                      return <Chip key={value} label={promo ? promo.name : value} />;
                    })}
                  </Box>
                )}
              >
                {availablePromotions.map((promo) => (
                  <MenuItem key={promo.id} value={promo.id}>
                    <Checkbox checked={(formValues.promotionIds || []).indexOf(promo.id) > -1} />
                    <ListItemText primary={promo.name} secondary={promo.type} />
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select one or more promotions to apply</FormHelperText>
            </FormControl>
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