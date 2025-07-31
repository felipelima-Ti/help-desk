import { useState, createContext, useEffect } from 'react';
import { auth, db, storage } from '../services/firebaseConection';
import { sendPasswordResetEmail } from 'firebase/auth'; // Importa a função correta da API modular do Firebase

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'


import { useNavigate } from 'react-router-dom';
import { Toast, toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState(null)
    const [id, setId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        async function loadUser() {
            const storageUser = localStorage.getItem('@ticketsPRO')

            if (storageUser) {
                setUser(JSON.parse(storageUser));
                setLoading(false);
            }

            setLoading(false);

        }
        loadUser();

    }, [])

    async function signIn(email, password) {
        setLoadingAuth(true);

        await signInWithEmailAndPassword(auth, email, password)
            .then(async (value) => {
                let uid = value.user.uid;
                const docRef = doc(db, "users", uid)
                const docSnap = await getDoc(docRef)

                let data = {
                    uid: uid,
                    nome: docSnap.data().nome,
                    password: docSnap.data().password,
                    email: value.user.email,
                    avatarUrl: docSnap.data().avatarUrl
                }
                setUser(data);
                storageUser(data);
                setLoadingAuth(false);
                toast.success("bem-vindo(a) de volta!")
                navigate("/dashboard")
            })
            .catch((error) => {
                console.log(error);
                setLoadingAuth(false);
                toast.error("algo deu errado :(")
            })
    }
    //cadastrar novo user
    async function signUp(email, password, name) {
        setLoadingAuth(true);

        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (value) => {
                let uid = value.user.uid

                await setDoc(doc(db, "users", uid), {
                    nome: name,
                    avatarUrl: null,

                })
                    .then(() => {
                        let data = {
                            uid: uid,
                            nome: name,
                            email: value.user.email,
                            avatarUrl: null
                        };
                        setUser(data);
                        storageUser(data);
                        setLoadingAuth(false);
                        toast.success("Seja bem-vindo ao sistema! ")
                        navigate("/dashboard")
                    })

            })
            .catch((error) => {
                console.log(error);
                setLoadingAuth(false);
            })
    }
    async function inicio() {
        navigate("/inicio")
    }


    function storageUser(data) {
        localStorage.setItem('@ticketsPRO', JSON.stringify(data))
    }
    async function logout() {
        await signOut(auth);
        localStorage.removeItem('@ticketsPRO');
        setUser(null);
    }
    async function resetPassword(email) {
        setLoadingAuth(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert('Email de redefinição de senha enviado!');
        } catch (error) {
            console.error("Erro ao enviar email: ", error);
        } finally {
            setLoadingAuth(false);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                signed: !!user,
                user,
                signIn,
                signUp,
                logout,
                loadingAuth,
                loading,
                storageUser,
                setUser,
                password,
                setPassword,
                id,
                setId,
                resetPassword
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
export default AuthProvider;
