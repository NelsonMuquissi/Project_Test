import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";

export default function IARulesPage({ onLogout }) {
    const [rules, setRules] = useState({
        tolerance: 0.05,
        descriptionMatch: true,
        fuzzySearch: true,
        daysOffset: 3,
        autoConfirmThreshold: 0.95
    });
    const { showNotification } = useAlert();

    const handleSave = () => {
        showNotification("Configurações de IA guardadas com sucesso!", "success");
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="rules-page-apple">
                <div className="page-header-apple">
                    <h1>Regras de IA</h1>
                    <p>Ajuste os parâmetros do motor de reconciliação automática para maior precisão.</p>
                </div>

                <div className="rules-grid">
                    <div className="rules-card glass-effect apple-shadow">
                        <div className="card-header">
                            <h3>Parâmetros de Precisão</h3>
                        </div>

                        <div className="rule-item">
                            <div className="rule-info">
                                <label>Tolerância de Valor (Kz)</label>
                                <p>Diferença máxima permitida entre transações para match automático.</p>
                            </div>
                            <input
                                type="number"
                                value={rules.tolerance}
                                onChange={(e) => setRules({ ...rules, tolerance: e.target.value })}
                                className="apple-input-small"
                            />
                        </div>

                        <div className="rule-item">
                            <div className="rule-info">
                                <label>Margem de Dias</label>
                                <p>Diferença máxima de dias entre o banco e o ERP.</p>
                            </div>
                            <input
                                type="number"
                                value={rules.daysOffset}
                                onChange={(e) => setRules({ ...rules, daysOffset: e.target.value })}
                                className="apple-input-small"
                            />
                        </div>
                    </div>

                    <div className="rules-card glass-effect apple-shadow">
                        <div className="card-header">
                            <h3>Algoritmos e Lógica</h3>
                        </div>

                        <div className="toggle-item">
                            <div className="rule-info">
                                <label>Análise de Descrição</label>
                                <p>Usar processamento de linguagem natural para comparar descritivos.</p>
                            </div>
                            <div className={`apple-toggle ${rules.descriptionMatch ? 'on' : ''}`} onClick={() => setRules({ ...rules, descriptionMatch: !rules.descriptionMatch })}>
                                <div className="toggle-knob"></div>
                            </div>
                        </div>

                        <div className="toggle-item">
                            <div className="rule-info">
                                <label>Fuzzy Search</label>
                                <p>Permitir correspondências aproximadas em nomes e referências.</p>
                            </div>
                            <div className={`apple-toggle ${rules.fuzzySearch ? 'on' : ''}`} onClick={() => setRules({ ...rules, fuzzySearch: !rules.fuzzySearch })}>
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="actions-bar">
                    <button onClick={handleSave} className="apple-button-primary">Guardar Alterações</button>
                </div>
            </div>

            <style>{`
                .rules-page-apple { padding: 20px 0; }
                .rules-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem; }
                .rules-card { padding: 2rem; border-radius: 24px; }
                
                .rule-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--system-border); }
                .rule-item:last-child { border-bottom: none; }
                
                .rule-info { flex: 1; padding-right: 2rem; }
                .rule-info label { font-weight: 600; font-size: 1rem; display: block; margin-bottom: 4px; }
                .rule-info p { font-size: 0.85rem; color: var(--system-text-secondary); line-height: 1.4; }

                .apple-input-small { width: 80px; padding: 10px; border-radius: 10px; border: 1px solid var(--system-border); text-align: center; font-weight: 600; }

                .toggle-item { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--system-border); }
                .toggle-item:last-child { border-bottom: none; }

                .apple-toggle { width: 50px; height: 28px; background: #E9E9EA; border-radius: 15px; position: relative; cursor: pointer; transition: background 0.3s; }
                .apple-toggle.on { background: #34C759; }
                .toggle-knob { width: 24px; height: 24px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .apple-toggle.on .toggle-knob { transform: translateX(22px); }

                .actions-bar { margin-top: 3rem; display: flex; justify-content: flex-end; }

                @media (max-width: 900px) {
                    .rules-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </DashboardLayout>
    );
}
