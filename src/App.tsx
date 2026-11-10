import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PageWrapper from './components/layout/PageWrapper';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import CampaignList from './pages/Campaigns/CampaignList';
import CampaignDetails from './pages/Campaigns/CampaignDetails';
import CreateCampaign from './pages/Campaigns/CreateCampaign';
import DesignTemplates from './pages/DesignTemplates';
import DesignStudio from './pages/DesignStudio';
import EmailAccounts from './pages/EmailAccounts';
import CommandCenter from './pages/CommandCenter';
import UsersRoles from './pages/UsersRoles';

// Auth Pages
import Login from './pages/Auth/Login';
import RequestAccess from './pages/Auth/RequestAccess';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<RequestAccess />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<PageWrapper />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="campaigns" element={<CampaignList />} />
            <Route path="campaigns/create" element={<CreateCampaign />} />
            <Route path="campaigns/:id" element={<CampaignDetails />} />
            <Route path="templates" element={<DesignTemplates />} />
            <Route path="studio" element={<DesignStudio />} />
            <Route path="accounts" element={<EmailAccounts />} />
            <Route path="command-center" element={<CommandCenter />} />
            <Route path="users" element={<UsersRoles />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;