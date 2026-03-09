import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAlert } from "../contexts/AlertContext";

export default function SettingsPage({ onLogout }) {
    const [settings, setSettings] = useState({
        language: 'pt',
        notifications: true,
        darkMode: false,
        compactMode: false
    });
    const { showNotification } = useAlert();

    const handleSave = () => {
        showNotification("Preferências atualizadas!", "success");
    };

    return (
        <DashboardLayout onLogout={onLogout}>
            <div className="settings-page-apple">
                <div className="page-header-apple">
                    <h1>Definições</h1>
                    <p>Personalize a sua experiência no Kutexa.</p>
                </div>

                <div className="settings-container glass-effect apple-shadow">
                    <div className="settings-section">
                        <h3>Interface</h3>

                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Idioma</label>
                                <p>Escolha o idioma principal da aplicação.</p>
                            </div>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                className="apple-select-small"
                            >
                                <option value="pt">Português (AO)</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Modo Escuro</label>
                                <p>Alternar para tema escuro (Automático conforme sistema).</p>
                            </div>
                            <div className={`apple-toggle ${settings.darkMode ? 'on' : ''}`} onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}>
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3>Notificações</h3>

                        <div className="setting-row">
                            <div className="setting-info">
                                <label>Alertas por E-mail</label>
                                <p>Receber notificações quando uma reconciliação for concluída.</p>
                            </div>
                            <div className={`apple-toggle ${settings.notifications ? 'on' : ''}`} onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}>
                                <div className="toggle-knob"></div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-actions">
                        <button onClick={handleSave} className="apple-button-primary">Aplicar Definições</button>
                    </div>
                </div>
            </div>

            <style>{`
                .settings-page-apple { padding: 20px 0; }
                .settings-container { max-width: 800px; margin-top: 2rem; border-radius: 24px; padding: 2.5rem; }
                
                .settings-section { margin-bottom: 3rem; }
                .settings-section h3 { font-size: 1.2rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--system-border); padding-bottom: 10px; }
                
                .setting-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
                .setting-info { flex: 1; padding-right: 2rem; }
                .setting-info label { font-weight: 600; display: block; margin-bottom: 4px; }
                .setting-info p { font-size: 0.85rem; color: var(--system-text-secondary); }

                .apple-select-small { padding: 8px 12px; border-radius: 10px; border: 1px solid var(--system-border); outline: none; background: white; }

                .apple-toggle { width: 50px; height: 28px; background: #E9E9EA; border-radius: 15px; position: relative; cursor: pointer; transition: background 0.3s; }
                .apple-toggle.on { background: #34C759; }
                .toggle-knob { width: 24px; height: 24px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .apple-toggle.on .toggle-knob { transform: translateX(22px); }

                .settings-actions { display: flex; justify-content: flex-end; pt-4; }
            `}</style>
        </DashboardLayout>
    );
}
