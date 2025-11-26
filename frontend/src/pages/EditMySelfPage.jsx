import * as React from 'react';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function EditMySelfPage(props) {
  const { token, storeCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = React.useState({
    name: '',
    email: '',
    birthday: '',
    avatar: null,
  });
  const [originalData, setOriginalData] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUserData({
            name: data.name || '',
            email: data.email || '',
            birthday: data.birthday ? data.birthday.split('T')[0] : '',
            avatar: null,
          });
          setOriginalData({
            name: data.name || '',
            email: data.email || '',
            birthday: data.birthday ? data.birthday.split('T')[0] : '',
            avatar: null,
          });
        } else {
          setError(data.error || 'Failed to load user data');
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUser();
  }, [token]);

  const handleChange = (field) => (event) => {
    const value = field === 'avatar' ? event.target.files[0] : event.target.value;
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData();

    if (userData.name !== originalData.name) formData.append('name', userData.name);
    if (userData.email !== originalData.email) formData.append('email', userData.email);
    if (userData.birthday !== originalData.birthday) formData.append('birthday', userData.birthday);
    if (userData.avatar instanceof File) formData.append('avatar', userData.avatar);

    try {
      const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update user');
        setSuccess(false);
      } else {
        setError('');
        setSuccess(true);

        setUserData((prev) => ({ ...prev, avatar: null }));
        setOriginalData((prev) => ({ ...prev, ...userData, avatar: null }));

        storeCurrentUser(data);
      }
    } catch (err) {
      setError(err.message);
      setSuccess(false);
    }

    setLoading(false);
  };

  const handleCancel = () => {
    setError('');
    navigate('/me');
  };

  return (
    <AppTheme {...props}>
      <Box sx={{ position: 'fixed', top: '0.75rem', right: '7.75rem', zIndex: 1000 }}>
        <ColorModeIconDropdown />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 6,
          px: 2,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Paper sx={{ width: '100%', maxWidth: 600, p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Edit User Information
          </Typography>

          <Stack spacing={3}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" variant="body2">
                User updated successfully!
              </Typography>
            )}

            <TextField
              label="Name"
              value={userData.name}
              onChange={handleChange('name')}
              fullWidth
            />
            <TextField
              label="Email"
              value={userData.email}
              onChange={handleChange('email')}
              type="email"
              fullWidth
            />
            <TextField
              label="Birthday"
              value={userData.birthday || ''}
              onChange={handleChange('birthday')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Button variant="outlined" component="label">
                Upload New Avatar
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleChange('avatar')}
                />
              </Button>
              {userData.avatar && typeof userData.avatar === 'object' && (
                <Typography variant="caption" sx={{ ml: 1 }}>
                  {userData.avatar.name}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" disabled={loading} onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                Save
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </AppTheme>
  );
}