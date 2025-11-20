import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import DashboardSideMenu from './components/DashboardSideMenu';
import AppTheme from '../shared-theme/AppTheme';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';
import { useAuth } from '../contexts/AuthContext.jsx';
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const VITE_BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Dashboard(props) {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const { token, storeUserIdAndRole } = useAuth();

  useEffect(() => {
    if(!token){
      navigate("/");
    }
    else{
      const fetchUserData = async () => {
        try {
          const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const user = await res.json();
          console.log(user);

          if (!res.ok) {
            console.error(`Error: ${user.message}`);
          }

          storeUserIdAndRole({ id: user.id, role: user.role });
          setUser(user);
        }catch (err) {
          console.error(`Unexpected error: ${err}`);
        }
      };

      fetchUserData();
    }
  }, [token, navigate]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <DashboardSideMenu avatar={user.avatar} name={user.name} email={user.email} />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            <MainGrid />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
