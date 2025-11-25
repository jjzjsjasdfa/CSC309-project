import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications/useNotifications';

import {
  getOne as getPromotion,
  updateOne as updatePromotion,
  validate as validatePromotion,
} from '../data/promotions';

import PromotionForm from './PromotionForm';
import PageContainer from './PageContainer';

function PromotionEditForm({ initialValues, onSubmit }) {
  const { promotionId } = useParams();
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

      const { issues } = validatePromotion(newValues);

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
    const { issues } = validatePromotion(formValues);

    if (issues && issues.length > 0) {
      setFormErrors(
        Object.fromEntries(issues.map((i) => [i.path?.[0], i.message]))
      );
      return;
    }

    setFormErrors({});

    try {
      await onSubmit(formValues);

      notifications.show('Promotion edited successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/promotions');
    } catch (err) {
      notifications.show(`Failed to edit promotion: ${err.message}`, {
        severity: 'error',
        autoHideDuration: 3000,
      });
      throw err;
    }
  }, [formValues, onSubmit, navigate, notifications, setFormErrors]);

  return (
    <PromotionForm
      formState={formState}
      onFieldChange={handleFieldChange}
      onSubmit={handleFormSubmit}
      onReset={handleReset}
      submitButtonLabel="Save"
      backButtonPath={`/promotions/${promotionId}`}
    />
  );
}

export default function PromotionEdit() {
  const { promotionId } = useParams();

  const [promotion, setPromotion] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await getPromotion(Number(promotionId));
      setPromotion(data);
    } catch (err) {
      setError(err);
    }

    setIsLoading(false);
  }, [promotionId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = React.useCallback(
    async (values) => {
      const updated = await updatePromotion(Number(promotionId), values);
      setPromotion(updated);
    },
    [promotionId]
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

    return promotion ? (
      <PromotionEditForm initialValues={promotion} onSubmit={handleSubmit} />
    ) : null;
  }, [isLoading, error, promotion, handleSubmit]);

  return (
    <PageContainer
      title={`Edit Promotion ${promotionId}`}
      breadcrumbs={[
        { title: 'Promotions', path: '/promotions' },
        { title: `Promotion ${promotionId}`, path: `/promotions/${promotionId}` },
        { title: 'Edit' },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
    </PageContainer>
  );
}
