import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import UserPromotionPage from "./pages/UserPromotionPage";
import CrudDashboard from "./pages/CrudDashboard"
import PromotionsDashboard from "./pages/PromotionsDashboard";
import EventsDashboard from "./pages/EventsDashboard"
import EventDetailPage from './pages/EventDetailPage';
import EventDetailDashboard from './pages/EventDetailDashboard.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SignIn disableCustomTheme={false} />} />
              <Route path="me" element={<Dashboard />} />
              <Route path="me/promotions" element={<PromotionsDashboard />} />
              {/*
              <Route path="manager/promotions" element={<ManagerPromotionsPage />} />
              <Route path="manager/promotions/new" element={<PromotionFormPage />} />
              <Route path="manager/promotions/:id" element={<PromotionFormPage />} />*/}
              <Route path="me/events" element={<EventsDashboard />} />
              <Route path="me/events/:eventId" element={<EventDetailDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
