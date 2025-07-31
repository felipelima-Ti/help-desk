import { useState, useEffect, useContext } from 'react';
import Header from "../../components/Header";
import Title from "../../components/Header/Title";
import './new.css';
import { FiPlusCircle } from 'react-icons/fi';
import { AuthContext } from '../../contexts/auth';
import { db } from '../../services/firebaseConection';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import avatarImg from '../../assets/avatar.png';

import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const listRef = collection(db, "customers");

export default function New() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [dueDate, setDueDate] = useState('');
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loadCustomer, setLoadCustomer] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  const [complemento, setComplemento] = useState('');
  const [assunto, setAssunto] = useState('Suporte');
  const [status, setStatus] = useState('Aberto');
  const [idCustomer, setIdCustomer] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)

        .then((snapshot) => {
          let lista = [];

          snapshot.forEach((doc) => {
            lista.push({
              id: doc.id,
              nomeFantasia: doc.data().nomeFantasia,
            });
          });

          if (snapshot.docs.size === 0) {
            console.log("Nenhuma empresa encontrada");
            setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
            setLoadCustomer(false);
            return;
          }

          setCustomers(lista);
          setLoadCustomer(false);

          if (id) {
            loadId(lista);
          }
        })
        .catch((error) => {
          console.log("ERROR AO BUSCAR CLIENTES", error);
          setLoadCustomer(false);
          setCustomers([{ id: '1', nomeFantasia: 'FREELA' }]);
        });
    }

    loadCustomers();
  }, [id]);

  async function loadId(lista) {
    const docRef = doc(db, "chamados", id);
    await getDoc(docRef)
      .then((snapshot) => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);
        setDueDate(snapshot.data().dueDate ? snapshot.data().dueDate.toDate().toISOString().substring(0, 10) : '');

        let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
        setCustomerSelected(index);
        setIdCustomer(true);
      })
      .catch((error) => {
        console.log(error);
        setIdCustomer(false);
      });
  }

  // Função para alterar o cliente selecionado
  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
    console.log(customers[e.target.value].nomeFantasia);
  }

  // Função para alterar o assunto do chamado
  function handleChangeSelect(e) {
    setAssunto(e.target.value);
    console.log(e.target.value);
  }

  // Função para alterar o status do chamado
  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  async function handleRegister(e) {
    e.preventDefault();

    // Verifica se estamos editando um chamado
    if (idCustomer) {
      const docRef = doc(db, "chamados", id);
      try {
        // Monta o objeto de atualização
        const updateData = {
          cliente: customers[customerSelected].nomeFantasia,
          clienteId: customers[customerSelected].id,
          assunto: assunto,
          complemento: complemento,
          status: status,
          userId: user.uid,
          nome: user.nome,
          avatarUrl: user.avatarUrl || avatarImg,
        };

        // Verifica se a data de vencimento foi preenchida antes de atualizar
        if (dueDate) {
          updateData.dueDate = Timestamp.fromDate(new Date(dueDate));
        }

        await updateDoc(docRef, updateData);
        toast.info("Chamado editado com sucesso!");
        setComplemento('');
        navigate('/dashboard');
      } catch (error) {
        toast.error("Algo deu errado :(");
        console.log(error);
      }
      return;
    }

    // Monta o objeto de criação 
    const newData = {
      created: new Date(),
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      complemento: complemento,
      status: status,
      userId: user.uid,
      nome: user.nome,
      avatarUrl: user.avatarUrl || avatarImg,
    };

    // Verifica se a data de vencimento foi preenchida antes de criar
    if (dueDate) {
      newData.dueDate = Timestamp.fromDate(new Date(dueDate));
    }

    try {
      await addDoc(collection(db, "chamados"), newData);
      toast.success("Chamado registrado com sucesso!");
      setComplemento('');
      setCustomerSelected(0);
      navigate('/dashboard');
    } catch (error) {
      toast.error("Ops!...erro ao registrar, tente mais tarde");
      console.log(error);
    }
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name={id ? "Editando chamado" : "Novo chamado"}>
          <FiPlusCircle size={25} />
        </Title>
        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Clientes</label>
            {loadCustomer ? (
              <input type="text" disabled={true} value="Carregando..." />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {customers.map((item, index) => (
                  <option key={index} value={index}>
                    {item.nomeFantasia}
                  </option>
                ))}
              </select>
            )}
            {user.nome}
            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="Suporte">Suporte</option>
              <option value="Visita Tecnica">Visita Tecnica</option>
              <option value="Financeiro">Financeiro</option>
            </select>
            <label>Status</label>
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                onChange={handleOptionChange}
                checked={status === 'Aberto'}
              />
              <span>Em aberto</span>
              <br></br>
              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                checked={status === 'Progresso'}
              />
              <span>Progresso</span>
              <br></br>
              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                checked={status === 'Atendido'}
              />
              <span>Atendido</span>
            </div>

            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema (opcional)."
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
            />
            <span>data de vencimento(opcional)</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <button type="submit">Registrar</button>

            {status === 'Atendido' && (
              <button className='excluir' type="button" onClick={handleDelete}>Excluir Chamado</button>
            )}


          </form>
        </div>
      </div>
    </div>
  );

  async function handleDelete() {
    if (!window.confirm('Tem certeza de que deseja excluir este chamado?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "chamados", id));
      toast.success("Chamado excluído com sucesso!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Erro ao excluir chamado.");
      console.log(error);

    }
  }
}