import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import {AuthProvider} from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import UserPromotionPage from "./pages/UserPromotionPage";
import PromotionsDashboard from "./pages/PromotionsDashboard";
import EditMySelfPage from "./pages/EditMySelfPage";
import CrudDashboard from "./pages/CRUD_dashboard/CrudDashboard";
import EmployeeList from './pages/CRUD_dashboard/components/EmployeeList';
import EmployeeShow from './pages/CRUD_dashboard/components/EmployeeShow';
import EmployeeCreate from './pages/CRUD_dashboard/components/EmployeeCreate';
import EmployeeEdit from './pages/CRUD_dashboard/components/EmployeeEdit';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SignIn />} />
              <Route path="me" element={<Dashboard />} />
              <Route path="me/account" element={<EditMySelfPage />} />
              <Route path="me/promotions" element={<PromotionsDashboard />} />
              {/*
              <Route path="manager/promotions" element={<ManagerPromotionsPage />} />
              <Route path="manager/promotions/new" element={<PromotionFormPage />} />
              <Route path="manager/promotions/:id" element={<PromotionFormPage />} />*/}
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="employees" element={<CrudDashboard />}>
              <Route index element={<EmployeeList />} />
              <Route path="new" element={<EmployeeCreate />} />
              <Route path=":employeeId" element={<EmployeeShow />} />
              <Route path=":employeeId/edit" element={<EmployeeEdit />} />
              <Route path="*" element={<EmployeeList />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
