import { useContext, useState } from 'react';
import avatarImg from '../../assets/avatar.png';
import { Link } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth';
import { FiHome, FiUser, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import './header.css';

export default function Header() {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  }

  return (
    <>
      {/* Botão para alternar o menu */}
      <button className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? <FiX size={24} color="red" /> : <FiMenu size={24} color="#white" />}
      </button>

      {/* Menu lateral */}
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div>
          <img src={user.avatarUrl === null ? avatarImg : user.avatarUrl} alt="Foto do usuario" />
        </div>
        <Link to="/dashboard">
          <FiHome color="#fff" size={24} />
          Chamados
        </Link>

        <Link to="/customers">
          <FiUser color="#fff" size={24} />
          Clientes
        </Link>
        
        <Link to="/profile">
          <FiSettings color="#fff" size={24} />
          Perfil
        </Link>
      </div>
    </>
  );
}