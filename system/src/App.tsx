import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalBackground from "./components/GlobalBackground";
import InactivityMonitor from "./components/InactivityMonitor";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import MyActivity from "./pages/MyActivity";
import ModuleAccess from "./pages/ModuleAccess";
import ModuleRoute from "./pages/ModuleRoute";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <GlobalBackground />
            <InactivityMonitor />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-activity"
                element={
                  <ProtectedRoute>
                    <MyActivity />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/module-access"
                element={
                  <ProtectedRoute>
                    <ModuleAccess />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/modules/:slug"
                element={
                  <ProtectedRoute>
                    <ModuleRoute />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
