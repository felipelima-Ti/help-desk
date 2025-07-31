import React from 'react';
import './signin.css';
import { Link } from 'react-router-dom';

function Inicio() {
    return (
            <div className='center'>
            <div className='conten'>
                <h1 className="title">O melhor help desk de chamados para sua empresa</h1>
                <p className='title2'>feito para grandes impresas perfeito para controle de demandas, resoluçao rapida de problemas, fornecendo suporte técnico e atendimento ao cliente</p>
                <br></br>
                <Link to="/user" className="button">
                    Experimente gratis
                </Link>
           </div>
           </div>
       
    );
}

export default Inicio;