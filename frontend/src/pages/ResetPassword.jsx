import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';

import AppTheme from '../shared-theme/AppTheme';
import ColorModeSelect from '../shared-theme/ColorModeSelect';
import { SitemarkIcon } from './components/CustomIcons';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function ResetPassword(props) {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [utorid, setUtorid] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/auth/resets/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            utorid: utorid,
            password: password 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: 'Password reset successful! Redirecting...' });
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Failed to reset password' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error occurred.' });
    }
  };

  return (
      <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      
      <SignInContainer direction="column" justifyContent="space-between">
        <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
        
        <Card variant="outlined">
          <SitemarkIcon />
          
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            Reset password
          </Typography>

          {status.msg && (
            <Alert severity={status.type} sx={{ width: '100%' }}>{status.msg}</Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="utorid">Confirm Utorid</FormLabel>
              <TextField
                id="utorid"
                type="text"
                name="utorid"
                placeholder="Enter your utorid"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={utorid}
                onChange={(e) => setUtorid(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <TextField
                name="password"
                placeholder="•••••••••"
                type="password"
                id="password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
            >
              Reset Password
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Link
                component={RouterLink}
                to="/"
                variant="body2"
                sx={{ alignSelf: 'center' }}
              >
                Back to Sign in
              </Link>
            </Box>

          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}