import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { DashboardLayout } from './components/DashboardLayout';
import { CreateOrgForm } from './components/CreateOrgForm';
import { StartupList } from './components/StartupList';
import { StartupDetail } from './components/StartupDetail'; // <-- 1. Imported the new page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <LoginForm />
          </div>
        } />

        <Route path="/" element={<DashboardLayout />}>
          {/* Your main dashboard view */}
          <Route index element={
            <div className="max-w-2xl mx-auto p-4">
              <h2 className="text-2xl font-semibold mb-6">Dashboard Management</h2>
              <CreateOrgForm onCreated={() => window.location.reload()} />
              <StartupList />
            </div>
          } />
          
          {/* 2. The NEW route for individual startups */}
          <Route path="startup/:id" element={<StartupDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


