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
import EditMySelfPage from "./pages/EditMyInfoDialog";
import CrudDashboard from "./pages/CRUD_dashboard/CrudDashboard";
import EmployeeList from './pages/CRUD_dashboard/components/EmployeeList';
import EmployeeShow from './pages/CRUD_dashboard/components/EmployeeShow';
import EmployeeCreate from './pages/CRUD_dashboard/components/EmployeeCreate';
import EmployeeEdit from './pages/CRUD_dashboard/components/EmployeeEdit';
import UserList from './pages/CRUD_dashboard/components/UserList';
import UserShow from './pages/CRUD_dashboard/components/UserShow';
import UserCreate from './pages/CRUD_dashboard/components/UserCreate';
import UserEdit from './pages/CRUD_dashboard/components/UserEdit';
import PromotionList from './pages/CRUD_dashboard/components/PromotionList';
import PromotionShow from './pages/CRUD_dashboard/components/PromotionShow';
import PromotionCreate from './pages/CRUD_dashboard/components/PromotionCreate';
import PromotionEdit from './pages/CRUD_dashboard/components/PromotionEdit';
import ResetPassword from './pages/ResetPassword';


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* user home page */}
            <Route path="/" element={<Layout />}>
              <Route index element={<SignIn />} />
              <Route path="me" element={<Dashboard />} />
              <Route path="me/account" element={<EditMySelfPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* promotion */}
            <Route path="promotions" element={<CrudDashboard />}>
              <Route index element={<PromotionList />} />
              <Route path="new" element={<PromotionCreate />} />
              <Route path=":promotionId" element={<PromotionShow />} />
              <Route path=":promotionId/edit" element={<PromotionEdit />} />
              <Route path="*" element={<PromotionList />} />
            </Route>

            {/* user */}
            <Route path="users" element={<CrudDashboard />}>
              <Route index element={<UserList />} />
              <Route path="new" element={<UserCreate />} />
              <Route path=":userId" element={<UserShow />} />
              <Route path=":userId/edit" element={<UserEdit />} />
              <Route path="*" element={<UserList />} />
            </Route>

            {/* template */}
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