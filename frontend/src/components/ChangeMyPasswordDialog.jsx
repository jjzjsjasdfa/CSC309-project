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
import { useAuth } from '../contexts/AuthContext.jsx';
import {useNavigate} from "react-router-dom";

const VITE_BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function ChangeMyPasswordDialog({ open, handleClose: setOpen }) {
  const [oldPassword, setOld] = React.useState('');
  const [newPassword, setNew] = React.useState('');
  const [isReset, setIsReset] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [dialogContentText, setDialogContentText] = React.useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    setDialogContentText('Enter the old and new password for your account.');
  }, []);

  const handleClose = () => {
    if(isReset){
      setIsReset(false);
      navigate("/")
    }else{
      setOpen(false);
    }
  };

  const clearData = () => {
    setOld('');
    setNew('');
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: () => {
          clearData();
          setIsReset(false);
          setError(false);
          setDialogContentText("Enter the old and new password for your account.");
        },
      }}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const formData = new FormData(event.currentTarget);
            const oldPassword = formData.get('old');
            const newPassword = formData.get('new');
            const res = await fetch(`${VITE_BACKEND_URL}/users/me/password`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ "old": oldPassword, "new": newPassword })
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
            setDialogContentText(`Password has been changed! Please login again.`);
            setIsReset(true);
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
      <DialogTitle>Change My Password</DialogTitle>
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
          value={oldPassword}
          id="old"
          name="old"
          label="old"
          placeholder="old password"
          type="text"
          onChange={(e) => setOld(e.target.value)}
          fullWidth
        />
        <OutlinedInput
          required
          margin="dense"
          value={newPassword}
          id="new"
          name="new"
          label="new"
          placeholder="new password"
          type="text"
          onChange={(e) => setNew(e.target.value)}
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

ChangeMyPasswordDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ChangeMyPasswordDialog;
