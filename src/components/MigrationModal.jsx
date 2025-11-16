import React, { useState, useContext } from "react";
import { BaitoContext } from "../context/BaitoContext";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function MigrationModal({ open, handleClose }) {
  const { migrateGuestToAccount, migrateGuestToGoogleAccount } =
    useContext(BaitoContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsMigrating(true);
    try {
      await migrateGuestToAccount(email, password);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleGoogleSubmit = async () => {
    setError("");
    setIsMigrating(true);
    try {
      await migrateGuestToGoogleAccount();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Save Your Data
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Create an account to save your guest data and access it from any
          device.
        </Typography>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isMigrating}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password (min. 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isMigrating}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={isMigrating}
          >
            {isMigrating ? (
              <CircularProgress size={24} />
            ) : (
              "Create Account & Save"
            )}
          </Button>
        </form>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* Google Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSubmit}
          disabled={isMigrating}
        >
          {isMigrating ? (
            <CircularProgress size={24} />
          ) : (
            "Continue with Google"
          )}
        </Button>

        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}
      </Box>
    </Modal>
  );
}

export default MigrationModal;
