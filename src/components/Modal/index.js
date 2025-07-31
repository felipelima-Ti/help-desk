import './modal.css';
import {FiX} from 'react-icons/fi'
export default function Modal({ conteudo, close,userId}){
    return(
        <div className="modal">
            <div className="container">
                <button className="close" onClick={ close }>
                    <FiX size={25} color="#fff"/>
                    voltar
                </button>
                <main>
                    <h2>Detalhes do chamado</h2>
                    <div className="row">
                        <span>
                    chamado de: <i>{conteudo.nome || 'Usuário desconhecido'}</i>
                    </span>
                        </div>
                        

                    <div className="row">
                        <span>
                            Cliente: <i>{conteudo.cliente}</i>
                        </span>
                    </div>
                    <div className='row'>
                         <span>
                        Assunto:<i>{conteudo.assunto}</i>
                        </span>
                        <span>
                            <br></br><br></br>
                            Cadastrado: <i>{conteudo.createdFormat}</i>
                            </span> 
                    </div>
                    <div>
                    <span>
        Status:
        <i 
            className="status-badge" 
            style={{
                color: "#FFF",
                backgroundColor: 
                    conteudo.status === 'Aberto' ? '#5cb85c' : conteudo.status === 'Progresso' ? '#f0ad4e' : '#808080' 
            }}
        >
            {conteudo.status}
        </i>
    </span>
</div>
                    {conteudo.complemento !== '' &&(
                    <>
                    <h3>Complemento</h3>
                    <p>
                       {conteudo.complemento}
                    </p>
                    </>
                )}
                </main>
            </div>
        </div>
    )
}