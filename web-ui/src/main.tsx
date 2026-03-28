import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentModeProvider } from './context/AgentModeContext';
import TechnicianApp from './pages/TechnicianApp';
import ManagerApp from './pages/ManagerApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AgentModeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/worker" replace />} />
          <Route path="/worker" element={<TechnicianApp />} />
          <Route path="/manager" element={<ManagerApp />} />
        </Routes>
      </BrowserRouter>
    </AgentModeProvider>
  </StrictMode>,
);
