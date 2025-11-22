import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventIcon from '@mui/icons-material/Event';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from "react-router";

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, href: '/me'},
  { text: 'Promotions', icon: <LocalOfferIcon />, href: '/me/promotions' },
  { text: 'Events', icon: <EventIcon />, href: '/me/events' }

];

const secondaryListItems = [
  { text: 'Logout', icon: <ExitToAppIcon /> },
];

export default function MenuContent() {
  const { removeTokenAndUser } = useAuth();
  const navigate = useNavigate();
  const logout = () => {
    removeTokenAndUser();
    navigate("/");
  }

  return (
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
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={logout}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
