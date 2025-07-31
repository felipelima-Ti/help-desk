import React, {useState,useContext} from 'react';
import './signin.css'
import user from '../../assets/user.png'
import {Link} from 'react-router-dom';
import {AuthContext} from '../../contexts/auth';



export default function SignIn(){
  const [email,setEmail] =useState('');
  const [password,setPassword] =useState('');

  const { signIn,loadingAuth } = useContext(AuthContext)

  async function handlesignIn(e){
    e.preventDefault();

   if(email !== '' && password !== ''){
    await signIn(email,password);
   }
  }
  return(
    <div className='container-center'>
      <div className='login'>
        <div className='login-area'>
          <img src={user} alt="logo sistema de chamados"/>
        </div>
        <form onSubmit={handlesignIn}>
          <h1>Entrar</h1>
          <input 
          type="text"
          placeholder="email@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
           <input 
          type="password"
          placeholder="******" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          />
          <button type='submit'>
            {loadingAuth ? "Carregando..." : "Acessar"}
          </button>
         
        </form>
        <Link to="/register">Criar uma conta</Link>
        <Link to='/forgot-password'>Esqueceu sua senha?</Link>{}
      </div>
    </div>
  )
}
