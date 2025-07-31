import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Header/Title'

import { FiUser, FiTrash2 } from 'react-icons/fi'

import { db } from '../../services/firebaseConection'
//import { useParams,useNavigate } from 'react-router-dom';
import { addDoc, collection, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore'


import { toast } from 'react-toastify'
import './customers.css';

export default function Customers() {
    const [customers, setCustomers] = useState([])
    const [nome, setNome] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [endereco, setEndereco] = useState('')


    useEffect(() => {
        async function fetchCustomers() {
            try {
                const querySnapshot = await getDocs(collection(db, "customers"));
                const customersList = [];
                querySnapshot.forEach((doc) => {
                    customersList.push({ id: doc.id, ...doc.data() });
                });
                setCustomers(customersList);
            } catch (error) {
                console.log(error);
                toast.error("Erro ao carregar clientes.");
            }
        }

        fetchCustomers();
    }, []);
    async function handleDeleteCustomer(id) {
        const confirmDelete = window.confirm("Tem certeza que deseja excluir este cliente?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "customers", id));
                toast.success("Cliente excluído com sucesso!");

                // Atualizar a lista de clientes após a exclusão
                setCustomers(customers.filter(customer => customer.id !== id));
            } catch (error) {
                console.log(error);
                toast.error("Erro ao excluir cliente.");
            }
        }
    }


    async function handleRegister(e) {
        e.preventDefault();

        if (nome !== '' !== '' && endereco !== '') {
            await addDoc(collection(db, "customers"), {
                nomeFantasia: nome,
                cnpj: cnpj,
                endereco: endereco
            })
                .then(() => {
                    setNome('')
                    setCnpj('')
                    setEndereco('')
                    toast.success("cliente cadastrado!")
                })
                .catch((error) => {
                    console.log(error);
                    toast.error("Erro ao fazer o cadastro.")
                })
        } else {
            toast.error("Preencha todos os campos!")
        }
    }


    return (
        <div>
            <Header />
            <div className="content">
                <Title name="Clientes">
                    <FiUser size={25} />
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>
                        <label>Nome do Cliente</label>
                        <input
                            type="text"
                            placeholder="Nome do Cliente/Empresa"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />
                        <br></br>
                        <label>Cnpj</label>
                        <input
                            type="text"
                            placeholder="Cnpj"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                        />
                        <br></br>
                        <label>Endereço</label>
                        <input
                            type="text"
                            placeholder="Digite o endereço"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />
                        <button type="submit">
                            Salvar
                        </button>
                    </form>
                </div>

                {/* Seção para listar os clientes */}
                <div className="customer-list">
                    <h2>Lista de Clientes</h2>
                    <ul>
                        {customers.map((customer) => (
                            <li className="espaco" key={customer.id}>
                                <strong>Nome:</strong> {customer.nomeFantasia} <br />
                                <strong>Cnpj:</strong> {customer.cnpj} <br />
                                <strong>Endereço:</strong> {customer.endereco}
                                <br></br>
                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteCustomer(customer.id)}
                                >
                                    <FiTrash2 size={20} color="#ff0000" /> {/* Ícone de lixeira */}
                                    Excluir Cliente
                                </button>
                                <hr />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}