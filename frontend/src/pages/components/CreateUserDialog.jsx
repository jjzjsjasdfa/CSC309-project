import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import {useEffect} from "react";
import { useAuth } from '../../contexts/AuthContext.jsx';

const VITE_BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function CreateUserDialog({ open, handleClose: setOpen }) {
  const [utorid, setUtorid] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState(false);
  const [dialogContentText, setDialogContentText] = React.useState('');
  const { token } = useAuth();

  useEffect(() => {
    setDialogContentText('Enter the utorid, name, and email of the new user.');
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const clearData = () => {
    setUtorid('');
    setName('');
    setEmail('');
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: () => {
          setError(false);
          setDialogContentText("Enter the utorid, name, and email of the new user.");
        },
      }}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const formData = new FormData(event.currentTarget);
            const utorid = formData.get('utorid');
            const name = formData.get('name');
            const email = formData.get('email');
            const res = await fetch(`${VITE_BACKEND_URL}/users`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ utorid, name, email })
            })
            const data = await res.json()

            // failure
            if (!res.ok) {
              setError(true);
              setDialogContentText(`${data.error}`);
              return;
            }

            // success
            clearData();
            setError(false);
            setDialogContentText(`User ${name} has been created!`);
          },
          sx: {
            backgroundImage: 'none',
            width: 'auto',
            maxWidth: '90%',
            height: 'auto',
            maxHeight: '90%'
          }
        },
      }}
    >
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText sx={{color: (theme) => error ? theme.palette.error.main : theme.palette.primary}}>
          { dialogContentText }
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          value={utorid}
          id="utorid"
          name="utorid"
          label="utorid"
          placeholder="utorid"
          type="text"
          onChange={(e) => setUtorid(e.target.value)}
          fullWidth
        />
        <OutlinedInput
          required
          margin="dense"
          value={name}
          id="name"
          name="name"
          label="name"
          placeholder="name"
          type="text"
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          value={email}
          id="email"
          name="email"
          label="email"
          placeholder="email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" type="submit">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

CreateUserDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default CreateUserDialog;
