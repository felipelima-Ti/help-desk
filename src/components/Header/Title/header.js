import { useContext } from 'react';
import './header.css';

export default function Header({ menuOpen, toggleMenu }) {
    return (
        <div className={`sidebar ${menuOpen ? '' : 'collapsed'}`}>
            <button onClick={toggleMenu}>{menuOpen ? 'Fechar Menu' : 'Abrir Menu'}</button>
          
        </div>
    );
}