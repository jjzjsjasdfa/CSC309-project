import { styled } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import OptionsMenu from './OptionsMenu';
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 240;


const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function DashboardSideMenu({ avatar, name, email }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <MenuContent />
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          sizes="small"
          alt="avatar"
          src={avatar}
          sx={{ width: 36, height: 36 }}
        />
        <Box sx={{ mr: 'auto', minWidth: 0, overflow: 'hidden' }}>
          <Tooltip title={name} arrow>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }} noWrap>
              {name}
            </Typography>
          </Tooltip>
          <Tooltip title={email} arrow>
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {email}
            </Typography>
          </Tooltip>
        </Box>
        <OptionsMenu />
      </Stack>
    </Drawer>
  );
}
