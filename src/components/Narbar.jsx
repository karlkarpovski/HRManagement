import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaUsers, FaMoneyBillWave, FaSyncAlt } from 'react-icons/fa';

function Navbar() {
  const { pathname } = useLocation();
  const active = (path) => pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <FaBuilding size={26} />
          <h1>HR & Payroll Dashboard</h1>
        </Link>
        <div className="navbar-links">
          <Link to="/employees" className={active('/employees')}>
            <FaUsers /> Nhân Viên
          </Link>
          <Link to="/payroll" className={active('/payroll')}>
            <FaMoneyBillWave /> Bảng Lương
          </Link>
          <Link to="/sync" className={active('/sync')}>
            <FaSyncAlt /> Đồng Bộ
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;