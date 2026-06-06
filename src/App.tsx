import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import { DashboardLayout } from './components/DashboardLayout';
import { CreateOrgForm } from './components/CreateOrgForm';
import { StartupList } from './components/StartupList';
import { StartupDetail } from './components/StartupDetail';
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              <LoginForm />
            </div>
          } />

          <Route path="/" element={<DashboardLayout />}>
            <Route index element={
              <div className="max-w-2xl mx-auto p-4">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white transition-colors">Dashboard Management</h2>
                
                {/* No trigger here, just an empty function! */}
                <CreateOrgForm onCreated={() => {}} />
                
                {/* No props passed here! */}
                <StartupList />
              
              </div>
            } />
            <Route path="startup/:id" element={<StartupDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

