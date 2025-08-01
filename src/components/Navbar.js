import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const today = new Date();
  const date = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Sunny Backreys</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Inventory</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/orders">Orders</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/records">Records</NavLink>
            </li>
          </ul>
          <span className="navbar-text">
            {date}
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
