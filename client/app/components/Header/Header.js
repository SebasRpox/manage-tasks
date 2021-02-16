import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header>
    <nav>
      <div className="nav-wrapper">
        <a href="#" className="brand-logo">Gestor de Tareas<i className="material-icons">book</i></a>
        <ul id="nav-mobile" class="right hide-on-med-and-down">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/registro">Registrarse</Link></li>
          <li><Link to="/">Iniciar Sesión</Link></li>
        </ul>
      </div>
    </nav>
    <hr />
  </header>
);

export default Header;
