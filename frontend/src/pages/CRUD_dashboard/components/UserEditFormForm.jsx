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
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useAuth } from "../../../contexts/AuthContext";
import dayjs, { Dayjs } from 'dayjs';

export default function UserEditFormForm({
  formState,
  onFieldChange,
  onSubmit,
  onReset,
  submitButtonLabel,
  backButtonPath,
}) {
  const { currentUser } = useAuth();
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

  const handleCheckboxFieldChange = React.useCallback(
    (event, checked) => {
      onFieldChange(event.target.name, checked);
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
    navigate(backButtonPath || '/users');
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
          {/* Email */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <TextField
              value={formValues.email ?? ''}
              onChange={handleTextFieldChange}
              name="email"
              label="Email"
              error={!!formErrors.email}
              helperText={formErrors.email ?? ' '}
              fullWidth
            />
          </Grid>

          {/* Role */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <FormControl error={!!formErrors.role} fullWidth>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                label="Role"
                value={formValues.role ?? ''}
                onChange={handleSelectFieldChange}
              >
                {(() => {
                  const optionsForRole = {
                    manager: ["regular", "cashier"],
                    superuser: ["regular", "cashier", "manager", "superuser"],
                  };

                  const allowedOptions = optionsForRole[currentUser?.role] || [];

                  return allowedOptions.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </MenuItem>
                  ));
                })()}
              </Select>
              <FormHelperText>{formErrors.role ?? ' '}</FormHelperText>
            </FormControl>
          </Grid>

          {/* Verified */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <FormControl>
              <FormControlLabel
                name="verified"
                control={
                  <Checkbox
                    size="large"
                    checked={formValues.verified ?? false}
                    onChange={handleCheckboxFieldChange}
                  />
                }
                label="Verified"
              />
              <FormHelperText error={!!formErrors.verified}>
                {formErrors.verified ?? ' '}
              </FormHelperText>
            </FormControl>
          </Grid>

          {/* Suspicious */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
            <FormControl>
              <FormControlLabel
                name="suspicious"
                control={
                  <Checkbox
                    size="large"
                    checked={formValues.suspicious ?? false}
                    onChange={handleCheckboxFieldChange}
                  />
                }
                label="Suspicious"
              />
              <FormHelperText error={!!formErrors.suspicious}>
                {formErrors.suspicious ?? ' '}
              </FormHelperText>
            </FormControl>
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
