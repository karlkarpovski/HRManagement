import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar           from './components/Navbar';
import EmployeeList     from './components/EmployeeList';
import EmployeeForm     from './components/EmployeeForm';
import PayrollGenerator from './components/PayrollGenerator';
import SyncDashboard    from './components/SyncDashboard';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(k => k + 1);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"                   element={<Navigate to="/employees" replace />} />
            <Route path="/employees"          element={<EmployeeList key={refreshKey} onRefresh={triggerRefresh} />} />
            <Route path="/employees/new"      element={<EmployeeForm onSuccess={triggerRefresh} />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm onSuccess={triggerRefresh} />} />
            <Route path="/payroll"            element={<PayrollGenerator />} />
            <Route path="/sync"               element={<SyncDashboard />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
      </div>
    </Router>
  );
}

export default App;