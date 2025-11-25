import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../shared-theme/AppTheme';
import DashboardLayout from './components/DashboardLayout';
import NotificationsProvider from './hooks/useNotifications/NotificationsProvider';
import DialogsProvider from './hooks/useDialogs/DialogsProvider';
import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from './theme/customizations';

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function CrudDashboard({ disableCustomTheme }) {
  return (
    <AppTheme disableCustomTheme={disableCustomTheme} themeComponents={themeComponents}>
      <CssBaseline enableColorScheme />
      <NotificationsProvider>
        <DialogsProvider>
          <DashboardLayout />
        </DialogsProvider>
      </NotificationsProvider>
    </AppTheme>
  );
}