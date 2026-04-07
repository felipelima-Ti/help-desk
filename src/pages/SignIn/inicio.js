import React from 'react';
import './signin.css';
import { Link } from 'react-router-dom';
import { FaUser } from "react-icons/fa";
import { FaCoins } from "react-icons/fa";
import { FaStar } from "react-icons/fa";   

function Inicio() {
    return (
            <div className='center'>
            <div className='conten'>
                <h1 className="title">O melhor help desk de chamados para sua empresa</h1>
                <div className='title2'>
                <p className='title2'>feito para grandes impresas perfeito para controle de demandas, resoluçao rapida de problemas, fornecendo suporte técnico e atendimento ao cliente</p>
                <br></br>
                <p className='titlea'>Estatísticas que comprovam nossa eficiência:</p>
                <div className="icons-container">
                    <div className="icon-item">
                        <FaUser size={50} color="#2d7cfa" />
                        <p className='text-icon'>Mais de 500 usuários </p>
                    </div>

                    <div className="icon-item">
                         <FaCoins size={50} color="#2d7cfa" />
                        <p className='text-icon'>Otimo custo beneficio </p>
                    </div>

                    <div className="icon-item">
                        <FaStar size={50} color="#2d7cfa" />
                        <p className='text-icon'>Otimas avaliações </p>
                    </div>
                    </div>
                     <Link to="/user" className="button">
                    <p>Experimente agora mesmo</p>
                </Link>
                    </div>
           </div>
           </div>     
       
    );
}

export default Inicio;