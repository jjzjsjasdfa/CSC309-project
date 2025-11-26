import React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import SideMenu from "../../components/SideMenu";
import {useAuth} from "../../../contexts/AuthContext";

const VITE_BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function DashboardLayout() {
  const theme = useTheme();
  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] = React.useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] = React.useState(false);
  const {currentUser} = useAuth();
  const avatarFullUrl = currentUser.avatarUrl ? `${VITE_BACKEND_URL}${currentUser.avatarUrl}` : null;

  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded) => {
      if (isOverMdViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
      } else {
        setIsMobileNavigationExpanded(newExpanded);
      }
    },
    [isOverMdViewport]
  );

  const layoutRef = React.useRef(null);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100vh',
        width: '100%',
      }}
    >
      <SideMenu avatar={avatarFullUrl} name={currentUser?.name} email={currentUser?.email} />
      <Box
        component="main"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          pt: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
