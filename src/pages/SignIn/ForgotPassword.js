import React, {useState, useContext} from 'react';
import './signin.css'
import {AuthContext} from '../../contexts/auth';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const { resetPassword, loadingAuth } = useContext(AuthContext); // função de reset

   function handleResetPassword(e) {
    e.preventDefault();
    if (email) {
        resetPassword(email); // Chama a função de reset de senha
      } else {
        alert('Por favor, insira um email válido.');
      }
    
    
  }

  return (
    <div className='container-center'>
      <div className='login'>
        <div className='login-area'>
          <h1 className='titulo'>Redefinir Senha</h1>
        </div>
        <br></br>
        <p>enviaremos um email pra voce para redefinir sua senha</p>
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br></br><br></br>
          <button type='submit'>
            {loadingAuth ? "Enviando..." : "Redefinir Senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ForgotPassword;