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

const VITE_BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function ForgotPassword({ open, setOpen }) {
  const [resetError, setResetError] = React.useState(false);
  const [dialogContentText, setDialogContentText] = React.useState('');

  useEffect(() => {
    setDialogContentText('Enter the account\'s utorid, and we\'ll give you a reset token.');
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: () => {
          setResetError(false);
          setDialogContentText("Enter the account's utorid, and we'll give you a reset token.");
        },
      }}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();

            // get reset token
            const formData = new FormData(event.currentTarget);
            const utorid = formData.get('utorid');
            const res = await fetch(`${VITE_BACKEND_URL}/auth/resets`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ utorid })
            })
            const data = await res.json()

            // failure
            if (!res.ok) {
              setResetError(true);
              setDialogContentText(`${data.error}`);
              return;
            }

            // success
            //TODO: send the token to the email address associated with the utorid
            const resetToken = data["resetToken"];

            setResetError(false);
            setDialogContentText(`We have sent you the email!`);
          },
          sx: {
            backgroundImage: 'none',
            width: '500px',
            maxWidth: '80%',
            height: '230px',
            maxHeight: '40%'
          }
        },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
      >
        <DialogContentText sx={{color: (theme) => resetError ? theme.palette.error.main : theme.palette.primary}}>
          { dialogContentText }
        </DialogContentText>
        <OutlinedInput
          autoFocus
          required
          margin="dense"
          id="utorid"
          name="utorid"
          label="utorid"
          placeholder="utorid"
          type="text"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" type="submit">
          Send Reset Token
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ForgotPassword.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ForgotPassword;
