import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddIcon from '@mui/icons-material/Add';
import Person2Icon from '@mui/icons-material/Person2';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as React from "react";
import CreateUserDialog from "../components/CreateUserDialog";

export default function MenuContent() {
  const { currentUser, removeTokenAndUser } = useAuth();
  const navigate = useNavigate();
  const [userCreationDialogOpen, setUserCreationDialogOpen] = React.useState(false);

  const mainListItems = [
    { text: 'Home', icon: <HomeRoundedIcon />, href: '/me' },
    { text: 'Promotions', icon: <LocalOfferIcon />, href: '/me/promotions' },
  ];

  const secondaryListItems = [
    {
      text: 'Create Account',
      icon: <AddIcon />,
      onClick: () => setUserCreationDialogOpen(true),
      allowedRoles: ['cashier', 'manager', 'superuser'],
    },
    {
      text: 'My Account',
      icon: <Person2Icon />,
      onClick: () => setUserCreationDialogOpen(true),
      allowedRoles: null,
    },
    {
      text: 'Logout',
      icon: <ExitToAppIcon />,
      onClick: () => {
        removeTokenAndUser();
        navigate('/');
      },
      allowedRoles: null,
    },
  ];

  const userRole = currentUser?.role;

  return (
    <>
      <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
        <List dense>
          {mainListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <ListItemButton component={RouterLink} to={item.href || "#"}
                selected={window.location.pathname === item.href}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <List dense>
          {secondaryListItems.map((item, index) => {
            const allowed = !item.allowedRoles || (userRole && item.allowedRoles?.includes(userRole));
            if (!allowed) return null;
            return (
              <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                <ListItemButton onClick={item.onClick}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Stack>
      <CreateUserDialog open={userCreationDialogOpen} handleClose={setUserCreationDialogOpen} />
    </>
  );
}