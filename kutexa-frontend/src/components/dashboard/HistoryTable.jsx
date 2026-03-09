
function HistoryTable({ data }) {
  const handleView = (id) => {
    console.log(`Visualizar item ${id}`);
    // Implementar lógica de visualização
  };

  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Data</th>
          <th>Transações</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <td>{item.empresa}</td>
            <td>{item.data}</td>
            <td>{item.transacoes}</td>
            <td>
              <span className={`status ${item.status}`}>
                {item.status === 'completed' ? 'Concluído' : 'Pendente'}
              </span>
            </td>
            <td>
              <i 
                className="fas fa-eye" 
                style={{color: 'var(--accent)', cursor: 'pointer'}}
                onClick={() => handleView(item.id)}
              ></i>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default HistoryTable;