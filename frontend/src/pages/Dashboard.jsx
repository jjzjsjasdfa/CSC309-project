import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import DashboardMainGrid from "./components/DashboardMainGrid";
import SideMenu from './components/SideMenu';
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
  const [data, setData] = useState([]);
  const { token, storeCurrentUser } = useAuth();

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

          storeCurrentUser(user);
          setUser(user);
        }catch (err) {
          console.error(`Unexpected error: ${err}`);
        }
      };

      fetchUserData();

      // TODO: collect data from user history
      setData([
        {
          title: 'Points',
          value: user.points,
          interval: 'Last 30 days',
          trend: 'up',
          data: [
            200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
            360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 920,
          ],
        },
        {
          title: 'Conversions',
          value: '325',
          interval: 'Last 30 days',
          trend: 'down',
          data: [
            1640, 1250, 970, 1130, 1050, 900, 720, 1080, 900, 450, 920, 820, 840, 600, 820,
            780, 800, 760, 380, 740, 660, 620, 840, 500, 520, 480, 400, 360, 300, 220,
          ],
        },
        {
          title: 'Event count',
          value: '200k',
          interval: 'Last 30 days',
          trend: 'neutral',
          data: [
            500, 400, 510, 530, 520, 600, 530, 520, 510, 730, 520, 510, 530, 620, 510, 530,
            520, 410, 530, 520, 610, 530, 520, 610, 530, 420, 510, 430, 520, 510,
          ],
        },
      ]);
    }
  }, [token, navigate]);

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu avatar={user.avatar} name={user.name} email={user.email} />
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
            pt: { xs: '64px', md: 0 }
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
            <DashboardMainGrid data={data} />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
