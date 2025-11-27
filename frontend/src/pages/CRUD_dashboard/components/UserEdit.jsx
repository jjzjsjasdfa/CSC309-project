import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications/useNotifications';

import {
  getOne as getUser,
  updateOne as updateUser,
  validate as validateUser,
} from '../data/users';

import UserEditFormForm from './UserEditFormForm';
import PageContainer from './PageContainer';

function UserEditForm({ initialValues, onSubmit }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState({
    values: initialValues,
    errors: {},
  });

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newValues) => {
    setFormState((prev) => ({
      ...prev,
      values: newValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newErrors) => {
    setFormState((prev) => ({
      ...prev,
      errors: newErrors,
    }));
  }, []);

  const handleFieldChange = React.useCallback(
    (name, value) => {
      const newValues = { ...formValues, [name]: value };

      const { issues } = validateUser(newValues);

      setFormErrors({
        ...formErrors,
        [name]: issues?.find((i) => i.path?.[0] === name)?.message,
      });

      setFormValues(newValues);
    },
    [formValues, formErrors, setFormValues, setFormErrors]
  );

  const handleReset = React.useCallback(() => {
    setFormValues(initialValues);
  }, [initialValues, setFormValues]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validateUser(formValues);

    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((i) => [i.path?.[0], i.message]))
      );
      return;
    }

    setFormErrors({});

    try {
      await onSubmit(formValues);

      notifications.show('User edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/users');
    } catch (err) {
      notifications.show(`Failed to edit user: ${err.message}`, {
        severity: 'error',
        autoHideDuration: 3000,
      });
      throw err;
    }
  }, [formValues, onSubmit, navigate, notifications, setFormErrors]);

  return (
    <UserEditFormForm
      formState={formState}
      onFieldChange={handleFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleReset}
      submitButtonLabel="Save"
      backButtonPath={`/users/${userId}`}
    />
  );
}

export default function UserEdit() {
  const { userId } = useParams();

  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await getUser(Number(userId));
      setUser({ email: data.email, verified: data.verified, suspicious: data.suspicious, role: data.role });
    } catch (err) {
      setError(err);
    }

    setIsLoading(false);
  }, [userId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (values) => {
      const updated = await updateUser(Number(userId), values);
      setUser(updated);
    },
    [userId]
  );

  const renderEdit = React.useMemo(() => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

    return user ? (
      <UserEditForm initialValues={user} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, user, handleSubmit]);

  return (
    <PageContainer
      title={`Edit User ${userId}`}
      breadcrumbs={[
        { title: 'Users', path: '/users' },
        { title: `User ${userId}`, path: `/users/${userId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
