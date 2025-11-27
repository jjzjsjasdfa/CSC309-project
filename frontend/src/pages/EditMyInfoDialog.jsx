import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import TextField from '@mui/material/TextField';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function EditMyInfoDialog({ open, handleClose: setOpen }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [birthday, setBirthday] = React.useState('');
  const [error, setError] = React.useState(false);
  const [dialogContentText, setDialogContentText] = React.useState('');
  const [originalData, setOriginalData] = React.useState({
    name: '',
    email: '',
    birthday: '',
  });
  const { token, storeCurrentUser } = useAuth();

  const clearData = () => {
    setName('');
    setEmail('');
    setBirthday('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const dateFormatter = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (!open) return;

    const fetchUser = async () => {
      setDialogContentText('Edit your profile information and click Save.');
      setError(false);

      try {
        const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        // failure
        if (!res.ok) {
          setError(true);
          setDialogContentText(data.error);
          return;
        }

        // success
        const mapped = {
          name: data.name || '',
          email: data.email || '',
          birthday: data.birthday ? dateFormatter(data.birthday) : '',
        };

        setName(mapped.name);
        setEmail(mapped.email);
        setBirthday(mapped.birthday);
        setOriginalData(mapped);
        setError(false);
      } catch (err) {
        setError(true);
        setDialogContentText(err.message);
      }
    };

    fetchUser();
  }, [open, token]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: () => {
          clearData();
          setError(false);
          setDialogContentText('Edit your profile information and click Save.');
        },
      }}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            event.stopPropagation();

            setError(false);

            const formData = new FormData(event.currentTarget);
            const name = formData.get('name') || '';
            const email = formData.get('email') || '';
            const birthday = formData.get('birthday') || '';
            const avatarFile = formData.get('avatar');

            const body = new FormData();

            if (name !== originalData.name) body.append('name', name);
            if (email !== originalData.email) body.append('email', email);
            if (birthday !== originalData.birthday) body.append('birthday', birthday);
            if (avatarFile instanceof File && avatarFile.size > 0) {
              body.append('avatar', avatarFile);
            }

            if ([...body.keys()].length === 0) {
              setDialogContentText('No changes to save.');
              return;
            }

            try {
              const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body,
              });

              const data = await res.json();

              // failure
              if (!res.ok) {
                setError(true);
                setDialogContentText(data.error);
                return;
              }

              // success
              setError(false);
              setDialogContentText('Your information has been updated.');
              setOriginalData({
                name,
                email,
                birthday,
              });

              setName(name);
              setEmail(email);
              setBirthday(birthday);

              storeCurrentUser(data);
              clearData();
            } catch (err) {
              setError(true);
              setDialogContentText(err.message);
            }

          },
          sx: {
            backgroundImage: 'none',
            minWidth: '400px',
            maxWidth: '90%',
            height: 'auto',
            maxHeight: '90%',
          },
        },
      }}
    >
      <DialogTitle>Edit My Info</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText
          sx={{
            color: (theme) =>
              error ? theme.palette.error.main : theme.palette.primary,
          }}
        >
          {dialogContentText}
        </DialogContentText>

        {/* Name */}
        <TextField
          margin="dense"
          value={name}
          id="name"
          name="name"
          label="name"
          type="text"
          onChange={(e) => setName(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Email */}
        <TextField
          margin="dense"
          value={email}
          id="email"
          name="email"
          label="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Birthday */}
        <TextField
          margin="dense"
          value={birthday}
          id="birthday"
          name="birthday"
          label="birthday"
          type="date"
          onChange={(e) => setBirthday(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        {/* Avatar */}
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/*"
          style={{ marginTop: 8 }}
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>
          Close
        </Button>
        <Button variant="contained" type="submit">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

EditMyInfoDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default EditMyInfoDialog;