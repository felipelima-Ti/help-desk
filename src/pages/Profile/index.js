import { useContext, useState} from 'react'
import Header from '../..//components/Header'
import Title from '../../components/Header/Title'
import { auth } from '../../services/firebaseConection';
import { deleteUser } from "firebase/auth";
import {FiSettings, FiTrash2, FiUpload} from 'react-icons/fi'
import avatar from '../../assets/avatar.png';
import {AuthContext} from '../../contexts/auth'

import { db, storage } from '../../services/firebaseConection'
import { doc, updateDoc,deleteDoc} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL,deleteObject, } from 'firebase/storage'


import {toast} from  'react-toastify'

import './profile.css';
import { Link } from 'react-router-dom'; 

export default function Profile(){
    const [menuOpen, setMenuOpen] = useState(true);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const { user, storageUser, setUser, logout} = useContext(AuthContext);

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
    const[imageAvatar,setImageAvatar] =  useState(null);
    const [nome,setNome] = useState(user && user.nome);
    const [email] = useState(user && user.email);
    const[imageUrl, setImageUrl] = useState('');
    

    function handleFile(e){
  if(e.target.files){
    const image= e.target.files[0];

    if(image.type === 'image/jpeg' || image.type === 'image/png'){
        setImageAvatar(image)
        setAvatarUrl(URL.createObjectURL(image))
    }else{
        alert("Envie uma imagem do tipo PNG ou JPEG ")
        setImageAvatar(null);
        return;
    }

      }
    }
    async function handleDeleteAccount() {
        if (window.confirm("Tem certeza de que deseja excluir sua conta? Esta ação é irreversível!")) {
            try {
                // Deletar os dados do usuário no Firestore
                const docRef = doc(db, "users", user.uid);
                await deleteDoc(docRef);
    
                // Deletar a conta do usuário do Firebase Authentication
                const currentUser = auth.currentUser;
                await deleteUser(currentUser);
    
                // Realizar logout após a exclusão da conta
                logout();
                toast.success("Conta excluída com sucesso!");
            } catch (error) {
                console.error("Erro ao excluir a conta:", error);
                toast.error("Erro ao excluir a conta. Tente novamente.");
            }
        }
    }

    async function handleUpload(){
    const currentUid = user.uid;

    const uploadRef = ref(storage,`images/${currentUid}/${imageAvatar.name}` )

    const uploadTask = uploadBytes(uploadRef, imageAvatar)
    .then((snapshot) =>{
     
        getDownloadURL(snapshot.ref).then(async (dowloadURL)=>{
        let urlFoto = dowloadURL;

        
        const docRef = doc(db, "users", user.uid)
        await updateDoc(docRef, {
        avatarUrl: urlFoto,
        nome: nome,
        
        })
        .then(() =>{
            let data = {
                ...user,
               
                nome: nome,
               
                avatarUrl: urlFoto,
            }
            setUser(data);
           
            storageUser(data);
            toast.success("Atualizado com sucesso!")
            })
         })
      })
    }

    async function handleDeletePhoto() {
        if (user.avatarUrl && window.confirm('Tem certeza de que deseja excluir sua foto?')) {
            try {
                // Tenta remover a imagem do Firebase Storage usando o caminho armazenado em avatarUrl
                const avatarRef = ref(storage, user.avatarUrl); 
    
                
                await deleteObject(avatarRef);
    
                
                const docRef = doc(db, "users", user.uid);
                await updateDoc(docRef, {
                    avatarUrl: null,
                });
    
                // Atualiza o estado do usuário localmente
                let data = {
                    ...user,
                    avatarUrl: null,
                };
                setUser(data);
                storageUser(data);
                setAvatarUrl(null);
                setImageAvatar(null);
                setImageUrl('');
                toast.success('Foto excluída com sucesso!');
            } catch (error) {
                console.error("Erro ao deletar a imagem do storage:", error);
                toast.error("Erro ao excluir a foto. Tente novamente.");
            }
        } else {
            toast.info("Cancelado com sucesso");
        }
    }



     async function handleSubmit(e){
      e.preventDefault();
        if(imageAvatar ===null && nome !== '' ){
        //atualizar nome do user
        const docRef  = doc(db,"users",user.uid)
        await updateDoc(docRef,{
            nome: nome,
        })
        .then(() => {
            let data = {
                ...user,
                nome: nome,
                  
            }
          
            setUser(data);
            storageUser(data);
            toast.success("Atualizado com sucesso!")
        });

    } else if (imageUrl !== '') {
            
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                avatarUrl: imageUrl,
                nome: nome,
            })
                .then(() => {
                    let data = {
                        ...user,
                        nome: nome,
                        avatarUrl: imageUrl,
                    };
                    setUser(data);
                    storageUser(data);
                    toast.success("Atualizado com sucesso!");
                });

               
        

        }else if(nome !== '' && imageAvatar !== null){
            
            handleUpload()
        }
    }
    return(
        <div>
            <Header menuOpen={menuOpen} toggleMenu={toggleMenu}/>
        
            <div className={`content ${menuOpen ? '' : 'collapsed'}`}>
            <Title name ="Meu perfil">
                <FiSettings size={25}/>
            </Title>

            <div className="container">
                <form className="form-profile" onSubmit={handleSubmit}>
                    <label className="label-avatar">
                        <span>
                            <FiUpload color="#fff" size={25} />
                        </span>
                        <input type="file" accept="image/*" onChange={handleFile} /> <br/>
                        {avatarUrl === null ? (
                            <img src={avatar} alt="Foto de perfil" width={160} height={160} />
                        ):(
                            <img src={avatarUrl} alt="Foto de perfil" width={160} height={160} />
                        )}
                         {avatarUrl && (
                        <button className="btn-delete-avatar" onClick={handleDeletePhoto}>
                           
                            <FiTrash2 color="white" size={18} /> Remover Foto
                            
                        </button>
                    )}
                    </label>
                    


                    <label>Nome</label>
                    <input type="text" value={nome} onChange={(e) => setNome(e.target.value) } />

                    <label className="reset">Email</label>
                    <input type="text" value={email} disabled={true} />
            <label>Senha</label>
            <div className="container">
    <Link to="/forgot-password" className="reset-password-link left-align">
        Esqueceu sua senha? Redefina aqui.
    </Link>
</div>
                   
                    <button type="submit">Salvar</button>

                </form>
               
            </div>

            <div className="container">
                <button className="logout-btn" onClick={ () => logout() }>Sair</button>
                <div className="container">
    <button className="logout-btn2" onClick={handleDeleteAccount}>
         Excluir Conta
    </button>
</div>
            </div>
            


        </div>
            
        </div>
        
    );

}