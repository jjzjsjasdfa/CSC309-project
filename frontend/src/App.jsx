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


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<SignIn disableCustomTheme={false}/>} />
              <Route path="me" element={<Dashboard />} />
              <Route path="me/promotions" element={<UserPromotionPage />} />
              {/*
              <Route path="manager/promotions" element={<ManagerPromotionsPage />} />
              <Route path="manager/promotions/new" element={<PromotionFormPage />} />
              <Route path="manager/promotions/:id" element={<PromotionFormPage />} />*/}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
