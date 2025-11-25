import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import dayjs, { Dayjs } from 'dayjs';

export default function PromotionForm({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel,
  backButtonPath,
}) {
  const formValues = formState.values || {};
  const formErrors = formState.errors || {};

  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formValues, onSubmit],
  );

  const handleTextFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const handleNumberFieldChange = React.useCallback(
    (event) => {
      const { name, value } = event.target;
      const numeric =
        value === '' ? null : Number.isNaN(Number(value)) ? null : Number(value);
      onFieldChange(name, numeric);
    },
    [onFieldChange],
  );

  const handleDateFieldChange = React.useCallback(
    (fieldName) => (value) => {
      if (value && value.isValid && value.isValid()) {
        onFieldChange(fieldName, value.toISOString());
      } else {
        onFieldChange(fieldName, null);
      }
    },
    [onFieldChange],
  );

  const handleSelectFieldChange = React.useCallback(
    (event) => {
      onFieldChange(event.target.name, event.target.value);
    },
    [onFieldChange],
  );

  const handleReset = React.useCallback(() => {
    if (onReset) {
      onReset(formValues);
    }
  }, [formValues, onReset]);

  const handleBack = React.useCallback(() => {
    navigate(backButtonPath || '/promotions');
  }, [navigate, backButtonPath]);

return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      autoComplete="off"
      onReset={handleReset}
      sx={{ width: '100%' }}
    >
      <FormGroup>
        <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
          {/* Name */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.name ?? ''}
              onChange={handleTextFieldChange}
              name="name"
              label="Name"
              error={!!formErrors.name}
              helperText={formErrors.name ?? ' '}
              fullWidth
            />
          </Grid>

          {/* Type */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
            <FormControl error={!!formErrors.type} fullWidth>
              <InputLabel id="promotion-type-label">Type</InputLabel>
              <Select
                labelId="promotion-type-label"
                name="type"
                label="Type"
                value={formValues.type ?? ''}
                onChange={handleSelectFieldChange}
                fullWidth
              >
                <MenuItem value="automatic">Automatic</MenuItem>
                <MenuItem value="one-time">One-time</MenuItem>
              </Select>
              <FormHelperText>{formErrors.type ?? ' '}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Description */}
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.description ?? ''}
              onChange={handleTextFieldChange}
              name="description"
              label="Description"
              multiline
              minRows={3}
              error={!!formErrors.description}
              helperText={formErrors.description ?? ' '}
              fullWidth
            />
          </Grid>

          {/* Start time */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={
                  formValues.startTime ? dayjs(formValues.startTime) : null
                }
                onChange={handleDateFieldChange('startTime')}
                label="Start time"
                slotProps={{
                  textField: {
                    error: !!formErrors.startTime,
                    helperText: formErrors.startTime ?? ' ',
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* End time */}
          <Grid item xs={12} sm={6} sx={{ display: 'flex' }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={formValues.endTime ? dayjs(formValues.endTime) : null}
                onChange={handleDateFieldChange('endTime')}
                label="End time"
                slotProps={{
                  textField: {
                    error: !!formErrors.endTime,
                    helperText: formErrors.endTime ?? ' ',
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Min spending */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <TextField
              type="number"
              value={formValues.minSpending ?? ''}
              onChange={handleNumberFieldChange}
              name="minSpending"
              label="Min spending"
              error={!!formErrors.minSpending}
              helperText={formErrors.minSpending ?? ' '}
              fullWidth
            />
          </Grid>

          {/* Rate */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <TextField
              type="number"
              value={formValues.rate ?? ''}
              onChange={handleNumberFieldChange}
              name="rate"
              label="Rate (e.g. 0.02)"
              error={!!formErrors.rate}
              helperText={formErrors.rate ?? ' '}
              fullWidth
            />
          </Grid>

          {/* Points */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex' }}>
            <TextField
              type="number"
              value={formValues.points ?? ''}
              onChange={handleNumberFieldChange}
              name="points"
              label="Points"
              error={!!formErrors.points}
              helperText={formErrors.points ?? ' '}
              fullWidth
            />
          </Grid>
        </Grid>
      </FormGroup>

      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {submitButtonLabel}
        </Button>
      </Stack>
    </Box>
  );
}
