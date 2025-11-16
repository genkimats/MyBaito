import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BaitoContext } from "../context/BaitoContext";
import { useThemeContext } from "../context/ThemeContext";
import { Button, IconButton } from "@mui/material"; // Import IconButton
import Brightness3Icon from "@mui/icons-material/Brightness3"; // Moon icon
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Sun icon
import MigrationModal from "./MigrationModal";
import "../css/NavBar.css";

function NavBar() {
  const { currentUser, isGuest, logout } = useContext(BaitoContext);
  const { mode, toggleColorMode } = useThemeContext(); // Get mode and toggle function
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="navbar-brand-link">
            <span style={{ color: "rgb(100, 181, 246)" }}>My</span>
            <span style={{ color: "rgb(2, 136, 209)" }}>Baito</span>
          </Link>
        </div>
        <div className="navbar-links">
          {currentUser || isGuest ? (
            <>
              <Link to="/" className="nav-link">
                Manage Workdays
              </Link>
              <Link to="/salary" className="nav-link">
                Check Salary
              </Link>
              <Link to="/settings" className="nav-link">
                Settings
              </Link>

              {isGuest && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setModalOpen(true)}
                >
                  Sign Up to Save
                </Button>
              )}

              <Button
                variant="outlined"
                size="small"
                onClick={handleLogout}
                sx={{ color: "white", borderColor: "white" }}
              >
                {isGuest ? "Exit" : "Logout"}
              </Button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
          <IconButton sx={{ color: "white" }} onClick={toggleColorMode}>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness3Icon />}
          </IconButton>
        </div>
      </nav>

      <MigrationModal
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
      />
    </>
  );
}

export default NavBar;
