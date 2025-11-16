import ManageWorkdayPage from "./pages/ManageWorkdayPage";
import SalaryPage from "./pages/SalaryPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";
import { Route, Routes } from "react-router-dom";
import { BaitoManager } from "./context/BaitoProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import { CustomThemeProvider } from "./context/ThemeProvider";
import ThemeApplicator from "./components/ThemeApplicator"; // Import the new component
import "./css/App.css";
import SplashScreen from "./components/SplashScreen";

function App() {
  return (
    <>
      <SplashScreen />
      <CustomThemeProvider>
        <ThemeApplicator /> {/* Add the ThemeApplicator here */}
        <BaitoManager>
          <NavBar />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ManageWorkdayPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/salary"
                element={
                  <ProtectedRoute>
                    <SalaryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </BaitoManager>
      </CustomThemeProvider>
    </>
  );
}

export default App;
