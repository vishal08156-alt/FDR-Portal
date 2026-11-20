
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./components/layout/MainLayout";
import FDRReview from "./pages/FDRReview";
import UploadFDR from "./pages/UploadFDR";
import VerificationQueue from "./pages/VerificationQueue";
import PlaceholderPage from "./pages/PlaceholderPage";
import MaturityManagement from "./pages/MaturityManagement";
import ReleaseManagement from "./pages/ReleaseManagement";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={<PlaceholderPage title="Dashboard" description="FDR management overview." />}
          />
          <Route
  path="/maturity-management"
  element={<MaturityManagement />}
/>

          <Route path="/upload-fdr" element={<UploadFDR />} />

          <Route path="/verification-queue" element={<VerificationQueue />} />

          <Route path="/verification-review" element={<FDRReview />} />

          <Route path="/verification-review/:id" element={<FDRReview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
  path="/release-management"
  element={<ReleaseManagement />}
/>

          <Route
            path="/reports"
            element={<PlaceholderPage title="Reports" description="FDR management reports." />}
          />

          <Route
            path="/settings"
            element={<PlaceholderPage title="Settings" description="Portal settings." />}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
