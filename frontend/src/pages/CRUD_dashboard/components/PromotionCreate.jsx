import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
  createOne as createPromotion,
  validate as validatePromotion,
} from '../data/promotions';
import PromotionForm from './PromotionForm';
import PageContainer from './PageContainer';

const INITIAL_FORM_VALUES = {
  name: '',
  description: '',
  type: 'automatic',
  startTime: null,
  endTime: null,
  minSpending: null,
  rate: null,
  points: null,
};

export default function PromotionCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [formState, setFormState] = React.useState(() => ({
    values: INITIAL_FORM_VALUES,
    errors: {},
  }));

  const formValues = formState.values;
  const formErrors = formState.errors;

  const setFormValues = React.useCallback((newFormValues) => {
    setFormState((prev) => ({
      ...prev,
      values: newFormValues,
    }));
  }, []);

  const setFormErrors = React.useCallback((newFormErrors) => {
    setFormState((prev) => ({
      ...prev,
      errors: newFormErrors,
    }));
  }, []);

  const handleFormFieldChange = React.useCallback(
    (name, value) => {
      const newFormValues = { ...formValues, [name]: value };

      setFormValues(newFormValues);

      const { issues } = validatePromotion(newFormValues);
      const fieldIssue = issues.find((issue) => issue.path?.[0] === name);

      setFormErrors({
        ...formErrors,
        [name]: fieldIssue ? fieldIssue.message : undefined,
      });
    },
    [formValues, formErrors, setFormValues, setFormErrors],
  );

  const handleFormReset = React.useCallback(() => {
    setFormValues(INITIAL_FORM_VALUES);
    setFormErrors({});
  }, [setFormValues, setFormErrors]);

  const handleFormSubmit = React.useCallback(async () => {
    const { issues } = validatePromotion(formValues);

    if (issues && issues.length > 0) {
      const errorObj = {};
      issues.forEach((issue) => {
        const field = issue.path?.[0];
        if (field) {
          errorObj[field] = issue.message;
        }
      });
      setFormErrors(errorObj);
      return;
    }

    setFormErrors({});

    try {
      await createPromotion(formValues);
      notifications.show('Promotion created successfully.', {
        severity: 'success',
        autoHideDuration: 3000,
      });

      navigate('/promotions');
    } catch (createError) {
      notifications.show(
        `Failed to create promotion. Reason: ${createError.message}`,
        {
          severity: 'error',
          autoHideDuration: 3000,
        },
      );
      throw createError;
    }
  }, [formValues, navigate, notifications, setFormErrors]);

  return (
    <PageContainer
      title="New Promotion"
      breadcrumbs={[
        { title: 'Promotions', path: '/promotions' },
        { title: 'New' },
      ]}
    >
      <PromotionForm
        formState={formState}
        onFieldChange={handleFormFieldChange}
        onSubmit={handleFormSubmit}
        onReset={handleFormReset}
        submitButtonLabel="Create"
        backButtonPath="/promotions"
      />
    </PageContainer>
  );
}
