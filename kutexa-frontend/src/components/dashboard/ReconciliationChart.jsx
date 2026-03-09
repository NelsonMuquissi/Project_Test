import { useEffect, useRef, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import API_URL from "../../config/apiConfig";

export default function Reconciliation() {
  const [bankStatementFile, setBankStatementFile] = useState(null);
  const [invoiceFiles, setInvoiceFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const { showNotification } = useAlert();
  const extratosRef = useRef(null);
  const [companies, setCompanies] = useState([]);
  const faturasRef = useRef(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/companies/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        if (data.length > 0) setSelectedCompany(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const processReconciliation = async () => {
    if (!bankStatementFile || invoiceFiles.length === 0) return;
    if (!selectedCompany) return showNotification("Selecione uma empresa", "warning");

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("companyId", selectedCompany);
      formData.append("periodStart", startDate);
      formData.append("periodEnd", endDate);
      formData.append("files", bankStatementFile);
      invoiceFiles.forEach((file) => formData.append("files", file));

      const response = await fetch(`${API_URL}/reconciliation-jobs/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        showNotification("✅ Reconciliação iniciada com sucesso!", "success");
        setBankStatementFile(null);
        setInvoiceFiles([]);
      } else {
        showNotification("Erro ao processar reconciliação", "error");
      }
    } catch (err) {
      showNotification("Erro de conexão", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="reconciliation-page-apple">
      <div className="dashboard-header-apple">
        <div className="header-text">
          <h1>Nova Reconciliação</h1>
          <p>Selecione os ficheiros para iniciar o processamento inteligente.</p>
        </div>
      </div>

      <div className="config-grid-apple glass-effect apple-shadow">
        <div className="config-field">
          <label>Empresa Beneficiária</label>
          <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="apple-select-large">
            {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
        </div>
        <div className="config-field">
          <label>Início do Período</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="apple-input-large" />
        </div>
        <div className="config-field">
          <label>Fim do Período</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="apple-input-large" />
        </div>
      </div>

      <div className="upload-grid-apple">
        <div className="upload-card-apple glass-effect apple-shadow">
          <div className="upload-card-header">
            <i className="fas fa-university"></i>
            <div>
              <h3>Extrato Bancário</h3>
              <span>Ficheiro principal (.pdf, .xlsx, .csv)</span>
            </div>
          </div>
          <div className={`drop-zone ${bankStatementFile ? 'has-file' : ''}`}
            onClick={() => extratosRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setBankStatementFile(e.dataTransfer.files[0]); }}>
            <i className={bankStatementFile ? "fas fa-check-circle success-icon" : "fas fa-cloud-upload-alt"}></i>
            <p>{bankStatementFile ? bankStatementFile.name : "Arraste ou clique para selecionar"}</p>
            {bankStatementFile && <span className="file-size-tag">{formatFileSize(bankStatementFile.size)}</span>}
            <input type="file" ref={extratosRef} hidden onChange={(e) => setBankStatementFile(e.target.files[0])} />
          </div>
        </div>

        <div className="upload-card-apple glass-effect apple-shadow">
          <div className="upload-card-header">
            <i className="fas fa-file-invoice"></i>
            <div>
              <h3>Documentos ERP</h3>
              <span>Facturas e Recibos (múltiplos)</span>
            </div>
          </div>
          <div className={`drop-zone ${invoiceFiles.length > 0 ? 'has-file' : ''}`}
            onClick={() => faturasRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setInvoiceFiles(Array.from(e.dataTransfer.files)); }}>
            <i className={invoiceFiles.length > 0 ? "fas fa-copy success-icon" : "fas fa-plus-circle"}></i>
            <p>{invoiceFiles.length > 0 ? `${invoiceFiles.length} ficheiros selecionados` : "Adicionar ficheiros"}</p>
            <input type="file" ref={faturasRef} hidden multiple onChange={(e) => setInvoiceFiles(Array.from(e.target.files))} />
          </div>
        </div>
      </div>

      <div className="action-footer-apple">
        <button className="btn-primary-large apple-shadow" onClick={processReconciliation} disabled={processing || !bankStatementFile}>
          {processing ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
          {processing ? "A Processar..." : "Iniciar Processamento"}
        </button>
      </div>

      <style>{`
        .reconciliation-page-apple { padding: 10px 0; }
        .config-grid-apple { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; padding: 1.5rem; border-radius: var(--border-radius); margin-bottom: 2rem; }
        .config-field { display: flex; flex-direction: column; gap: 8px; }
        .config-field label { font-size: 0.85rem; font-weight: 600; color: var(--system-text-secondary); }
        .apple-input-large, .apple-select-large { padding: 12px; border-radius: 10px; border: 1px solid var(--system-border); background: white; font-size: 1rem; outline: none; }
        
        .upload-grid-apple { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .upload-card-apple { padding: 2rem; border-radius: var(--border-radius); }
        .upload-card-header { display: flex; align-items: center; gap: 15px; margin-bottom: 2rem; }
        .upload-card-header i { font-size: 1.8rem; color: var(--system-accent); }
        .upload-card-header h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }
        .upload-card-header span { font-size: 0.85rem; color: var(--system-text-secondary); }
        
        .drop-zone { border: 2px dashed var(--system-border); border-radius: 15px; padding: 3rem 1rem; text-align: center; cursor: pointer; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .drop-zone:hover { border-color: var(--system-accent); background: rgba(0, 113, 227, 0.02); }
        .drop-zone.has-file { border-color: var(--system-success); background: rgba(52, 199, 89, 0.02); }
        .drop-zone i { font-size: 2.5rem; color: var(--system-text-secondary); margin-bottom: 10px; }
        .drop-zone .success-icon { color: var(--system-success); }
        .drop-zone p { font-size: 1rem; font-weight: 500; color: var(--system-text); margin: 0; }
        .file-size-tag { font-size: 0.8rem; background: var(--system-bg); padding: 2px 8px; border-radius: 5px; }
        
        .action-footer-apple { display: flex; justify-content: center; }
        .btn-primary-large { background: var(--system-accent); color: white; padding: 16px 40px; border-radius: 30px; border: none; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .btn-primary-large:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 113, 227, 0.4); }
        .btn-primary-large:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }
        
        @media (max-width: 768px) { .upload-grid-apple { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
