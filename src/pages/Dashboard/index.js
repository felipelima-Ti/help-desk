import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/auth';
import Header from '../../components/Header';
import Title from '../../components/Header/Title';
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, limit, startAfter, query, doc, deleteDoc,where } from 'firebase/firestore';
import { db } from '../../services/firebaseConection';
import { format, isBefore } from 'date-fns';
import Modal from '../../components/Modal';
import avatarImg from '../../assets/avatar.png';
import './dashboard.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'

const listRef = collection(db, "chamados");

export default function Dashboard() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [lastDocs, setLastDocs] = useState();
  const [loadingMore, setLoadingMore] = useState(false);
  const { user,userId } = useContext(AuthContext);
  const [showPostModal, setShowPostModal] = useState(false);
  const [detail, setDetail] = useState();
  const [statusCounts, setStatusCounts] = useState({ Aberto: 0, Progresso: 0, Atendido: 0 });
  const [overdueCount, setOverdueCount] = useState(0); // Contador de chamados vencidos
  const [filterCliente, setFilterCliente] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterAssunto, setFilterAssunto] = useState(''); // Novo estado para o filtro de assunto
  useEffect(() => {
    async function loadChamados() {
      const q = query(listRef, orderBy('created', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      setChamados([]);
      await updateState(querySnapshot);
      setLoading(false);
    }
    loadChamados();
    return () => { };
  }, []);

  async function updateState(querySnapshot) {
    const isCollectionEmpty = querySnapshot.size === 0;
  
    if (!isCollectionEmpty) {
      let lista = [];
      let counts = { Aberto: 0, Progresso: 0, Atendido: 0 };
      let overdue = 0; // Inicializa o contador de vencidos
      const today = new Date();
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
  
        // Verificando o valor do campo "assunto"
        console.log("Assunto do documento: ", data.assunto); // Adicione isso aqui para ver o assunto
  
        const createdZoned = toZonedTime(data.created.toDate(), 'America/Sao_Paulo');
        const createdFormatted = format(createdZoned, 'dd/MM/yyyy');
  
        let dueDate = data.dueDate ? data.dueDate.toDate() : null;
  
        // Adiciona um dia à data de vencimento
        if (dueDate) {
          dueDate.setDate(dueDate.getDate() + 1);
        }
  
        const isVencido = dueDate ? isBefore(dueDate, today) : false;
  
        lista.push({
          id: doc.id,
          assunto: data.assunto,
          cliente: data.cliente,
          clienteId: data.clienteId,
          avatarUrl: data.avatarUrl,
          created: data.created,
          createdFormat: format(data.created.toDate(), 'dd/MM/yyyy'),
          status: data.status,
          complemento: data.complemento,
          nome: data.nome,
          isVencido: isVencido,
          dueDate: dueDate ? format(dueDate, 'dd/MM/yyyy') : 'sem prazo',
        });
  
        // Contagem de chamados por status
        if (data.status === 'Aberto') counts.Aberto += 1;
        if (data.status === 'Progresso') counts.Progresso += 1;
        if (data.status === 'Atendido') counts.Atendido += 1;
  
        // Incrementa o contador de vencidos
        if (isVencido) {
          overdue += 1;
        }
      });
  
      setStatusCounts(counts);
      setOverdueCount(overdue); // Define o estado de chamados vencidos
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setChamados((chamados) => [...chamados, ...lista]);
      setLastDocs(lastDoc);
    } else {
      setIsEmpty(true);
    }
    setLoadingMore(false);
  }
  
  async function handleMore() {
    setLoadingMore(true);

    let q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(100));

    if (filterStartDate) {
        const startDate = new Date(filterStartDate);
        q = query(q, where('created', '>=', startDate));
    }
    if (filterEndDate) {
        const endDate = new Date(filterEndDate);
        endDate.setDate(endDate.getDate() + 1); // Adiciona 1 dia à data final
        q = query(q, where('created', '<=', endDate));
    }
    if (filterDueDate) {
      const dueDate = new Date(filterDueDate);
      dueDate.setHours(23, 59, 59, 999); // Final do dia do prazo
      q = query(q, where('dueDate', '<=', dueDate));
    }
  
    if (filterCliente) {
        q = query(q, where('cliente', '==', filterCliente));
    }
    if (filterStatus) {
        q = query(q, where('status', '==', filterStatus));
    }

    try {
        const querySnapshot = await getDocs(q);
        await updateState(querySnapshot);
    } catch (error) {
        console.error("Erro ao buscar mais documentos: ", error);
        toast.error("Erro ao buscar mais documentos.");
    } finally {
        setLoadingMore(false);
    }
}

async function handleFilter() {
  setLoading(true);
  console.log('Iniciando filtro...');

  // Define a consulta inicial
  let q = query(listRef, orderBy('created', 'desc'), limit(100));

  // Filtro por Cliente
  if (filterCliente) {
    console.log(`Filtrando por cliente: ${filterCliente}`);
    q = query(q, where('cliente', '==', filterCliente.trim()));
  }

  // Filtro por Status
  if (filterStatus) {
    console.log(`Filtrando por status: ${filterStatus}`);
    q = query(q, where('status', '==', filterStatus));
  }

  // Filtro por Assunto
  if (filterAssunto) {
    console.log(`Filtrando por assunto: ${filterAssunto}`);
    q = query(q, where('assunto', '==', filterAssunto.trim())); // Verifica o campo "assunto" no Firestore
  }

  // Filtro por Data Inicial
  if (filterStartDate) {
    const startDate = new Date(filterStartDate);
    console.log(`Filtrando a partir da data: ${startDate}`);
    q = query(q, where('created', '>=', startDate));
  }

  // Filtro por Data Final
  if (filterEndDate) {
    const endDate = new Date(filterEndDate);
    endDate.setDate(endDate.getDate() + 1); // Adiciona 1 dia à data final
    console.log(`Filtrando até a data: ${endDate}`);
    q = query(q, where('created', '<=', endDate));
  }

  try {
    // Obtém os resultados da consulta
    const querySnapshot = await getDocs(q);
    console.log(`Documentos encontrados: ${querySnapshot.size}`);

    // Limpa os chamados antes de atualizar
    setChamados([]);
    
    // Atualiza o estado com os resultados filtrados
    await updateState(querySnapshot);
  } catch (error) {
    console.error("Erro ao aplicar filtros: ", error);
    toast.error("Erro ao aplicar filtros.");
  } finally {
    setLoading(false);
  }
}
  
  async function handleDelete(id) {
    if (!window.confirm('Tem certeza de que deseja excluir este chamado?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "chamados", id));
      toast.success("Chamado excluído com sucesso!");
      setChamados(chamados.filter((chamado) => chamado.id !== id));
    } catch (error) {
      toast.error("Erro ao excluir o chamado.");
      console.log(error);
    }
  }

  function toggleModal(item) {
    setShowPostModal(!showPostModal);
     setDetail(item);
}

  if (loading) {
    return (
      <div>
        <Header />
        <div className="content">
          <Title name="Chamados">
            <FiMessageSquare size={25} />
          </Title>

          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    );
  }

  // Dados do gráfico de barras
  const data = [
    { name: '', aberto: statusCounts.Aberto },
    { name: '', progresso: statusCounts.Progresso },
    { name: '', atendido: statusCounts.Atendido },
    { name: '', vencidos: overdueCount }
  ];

 

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Chamados">
          <FiMessageSquare size={25} />
        </Title>

        <Link to="/new" className="new">
          <FiPlus color="#FFF" size={25} />
          Novo chamado
        </Link>
        
        <div className="dashboard-container">
          <div className="chart-container">
            <h3>Distribuição de Chamados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/>
                
                <Tooltip />
                <Legend />
                
                <Bar dataKey="aberto" fill="green" />
                <Bar dataKey="progresso" fill="orange" />
                <Bar dataKey="atendido" fill="gray" />
                <Bar dataKey="vencidos" fill="red" />
              </BarChart>
            </ResponsiveContainer>
          </div>

         
        </div>
        <div className="filter-container">
  <h3>Filtrar</h3>

  <input
    type="text"
    placeholder="Buscar por Cliente"
    value={filterCliente}
    onChange={(e) => setFilterCliente(e.target.value)}
  />

  <select className='filterr'
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="">Status</option>
    <option value="Aberto">Aberto</option>
    <option value="Progresso">Em Progresso</option>
    <option value="Atendido">Atendido</option>
  </select>
  <select className='filterr'
    value={filterAssunto}
    onChange={(e) => setFilterAssunto(e.target.value)}
  >
    <option value="">Assunto</option>
    <option value="Suporte">Suporte</option>
    <option value="Visita Tecnica">Visita Tecnica</option>
    <option value="Financeiro">Financeiro</option>
  </select>
 

<label htmlFor="dueDate">Cadastro</label>
  <input
    type="date"
    
    value={filterEndDate}
    onChange={(e) => setFilterEndDate(e.target.value)}
  />
  <label htmlFor="dueDate">Prazo</label>
   <input
    type="date"
    value={filterDueDate}
    onChange={(e) => setFilterDueDate(e.target.value)}
    placeholder="Filtrar por Prazo"
  />

  <button onClick={handleFilter}>Aplicar Filtros</button>
  
</div>

        {chamados.length === 0 ? (
          <div className="container dashboard">
            <span>Nenhum chamado encontrado...</span>
          </div>
          
        ) : (
          
          <table>
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">Assunto</th>
                <th scope="col">Status</th>
                <th scope="col">Cadastrado</th>
                <th scope="col">Opções</th>
                <th scope="col">Prazo</th> {/* Ajustado aqui */}
              </tr>
            </thead>
            <tbody>
              {chamados.map((item, index) => (
                <tr key={index}>
                  <td data-label="Cliente">
                    <img
                      src={item.avatarUrl ? item.avatarUrl : avatarImg}
                      alt="Avatar"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%', marginRight: '8px' }}
                    />
                    {item.cliente}
                  </td>
                  <td data-label="Assunto">{item.assunto}</td>
                  <td data-label="Status">
                    <span
                      className="badge"
                      style={{ backgroundColor: item.status === 'Aberto' ? '#5cb85c' : item.status === 'Progresso' ? '#f0ad4e' : '#999' }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td data-label="Cadastrado">{item.createdFormat}</td>
                  
                  <td data-label="Opções">

                    <button
                      className="action"
                      style={{ backgroundColor: '#3583f6' }}
                      onClick={() => toggleModal(item)}
                    >
                      <FiSearch color="#fff" size={18} />
                    </button>
                    <Link to={`/new/${item.id}`} className="action" style={{ backgroundColor: '#f6a935' }}>
                      <FiEdit2 className="edit" color="#fff" size={18} />
                    </Link>
                    <button
                      className="action"
                      style={{ backgroundColor: '#d9534f' }}
                      onClick={() => handleDelete(item.id)}
                    >
                      <FiTrash2 color="#fff" size={18} />
                    </button>
                  </td>
                  <td data-label="Prazo" style={{ color: item.isVencido ? 'red' : 'inherit' }}>
                    {item.dueDate} {}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {loadingMore && <h3>Buscando mais...</h3>}
        {!loadingMore && !isEmpty && <button className="btn-more" onClick={handleMore}>Buscar mais</button>}

        {showPostModal && (
          <Modal
            conteudo={detail}
            
            close={() => setShowPostModal(!showPostModal)}
          />
        )}
      </div>
    </div>
  );
}