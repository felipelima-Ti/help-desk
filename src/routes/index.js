import { Routes, Route } from 'react-router-dom'

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import Customers from '../pages/Customers';
import New from '../pages/New';
import Inicio from '../pages/SignIn/inicio';
import Private from './private';
import ForgotPassword from '../pages/SignIn/ForgotPassword';

function RoutesApp(){
  return(
    <Routes>
      
      <Route path="/" element={ <Inicio/> } />
      <Route path="/user" element={<SignIn/>}/>

      <Route path="/register" element={ <SignUp/> } />
      <Route path="/forgot-password" element={<ForgotPassword/>}/>

      <Route path="/dashboard" element={<Private><Dashboard/></Private>}/>

      <Route path="/profile" element={<Private><Profile/></Private>} />

      <Route path="/customers"element={<Private><Customers/></Private>}/>
      
      <Route path="/new"element={<Private><New/></Private>} />

      <Route path="/new/:id"element={<Private><New/></Private>} />
      <Route path="/forgot-password" component={ForgotPassword} />
     

    </Routes>
  )
}

export default RoutesApp;