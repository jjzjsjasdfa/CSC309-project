import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { createOne, validate } from '../data/transactions';
import TransactionForm from './TransactionForm';
import PageContainer from './PageContainer';

const INITIAL_VALUES = {
  type: '',
  utorid: '',
  recipientId: '',
  spent: '',
  amount: '',
  relatedId: '',
  remark: '',
};

export default function TransactionCreate() {
  const navigate = useNavigate();
  const notifications = useNotifications();
  const [formState, setFormState] = React.useState({ values: INITIAL_VALUES, errors: {} });

  const handleFieldChange = (name, value) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: {},
    }));
  };

  const handleSubmit = async () => {
    const { values } = formState;

    const { issues } = validate(values);
    if (issues && issues.length > 0) {
      const errs = {};
      issues.forEach(i => { if(i.path?.[0]) errs[i.path[0]] = i.message; });
      setFormState(prev => ({ ...prev, errors: errs }));
      return;
    }

    // only send fields that are relevant to the specific Transaction Type
    let payload = {
        type: values.type,
        remark: values.remark
    };

    if (values.type === 'purchase') {
        payload.utorid = values.utorid;
        payload.spent = Number(values.spent);
    } 
    else if (values.type === 'adjustment') {
        payload.utorid = values.utorid;
        payload.amount = Number(values.amount);
        payload.relatedId = Number(values.relatedId);
    } 
    else if (values.type === 'transfer') {
        payload.amount = Number(values.amount);
        payload.recipientId = values.recipientId;
    } 
    else if (values.type === 'redemption') {
        payload.amount = Number(values.amount);
    }

    try {
      // 3. Send the clean payload
      await createOne(payload);
      notifications.show('Transaction created successfully.', { severity: 'success' });
      navigate('/transactions');
    } catch (err) {
      notifications.show(`Creation failed: ${err.message}`, { severity: 'error' });
    }
  };

  return (
    <PageContainer title="New Transaction" breadcrumbs={[{ title: 'Transactions', path: '/transactions' }, { title: 'New' }]}>
      <TransactionForm
        formState={formState}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        submitButtonLabel="Create"
      />
    </PageContainer>
  );
}