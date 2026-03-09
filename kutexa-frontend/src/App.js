import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import { AlertProvider } from "./contexts/AlertContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Base
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import ReconciliationHistoryPage from "./pages/ReconciliationHistoryPage";
import ReconciliationDetailsPage from "./pages/ReconciliationDetailsPage";
import MinhasEmpresasPage from "./pages/ListarEmpresasPage";
import CadastramentoDeUsuarioPage from "./pages/cadastrarUsuarioEmpresa";

// Novos Componentes das Funcionalidades Completas
import ProfilePage from "./pages/ProfilePage";
import TeamPage from "./pages/TeamPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SettingsPage from "./pages/SettingsPage";
import IARulesPage from "./pages/IARulesPage";
import ReportsSummaryPage from "./pages/ReportsSummaryPage";
import ReportsPerformancePage from "./pages/ReportsPerformancePage";
import ReportsExportsPage from "./pages/ReportsExportsPage";
import BankAccountsPage from "./pages/BankAccountsPage";

function App() {
  return (
    <AlertProvider>
      <Router>
        <Routes>
          {/* Autenticação */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Dashboard Principal */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Reconciliação */}
          <Route path="/reconciliation" element={<ProtectedRoute><ReconciliationPage /></ProtectedRoute>} />
          <Route path="/reconciliation-history" element={<ProtectedRoute><ReconciliationHistoryPage /></ProtectedRoute>} />
          <Route path="/reconciliation-history/:jobId" element={<ProtectedRoute><ReconciliationDetailsPage /></ProtectedRoute>} />

          {/* Configuração de Empresa e Usuários */}
          <Route path="/minhas-empresas" element={<ProtectedRoute><MinhasEmpresasPage /></ProtectedRoute>} />
          <Route path="/configurar-empresa/:id" element={<ProtectedRoute><CadastramentoDeUsuarioPage /></ProtectedRoute>} />
          <Route path="/bank-accounts/:companyId" element={<ProtectedRoute><BankAccountsPage /></ProtectedRoute>} />

          {/* Novas Rotas Funcionais */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/ia-rules" element={<ProtectedRoute><IARulesPage /></ProtectedRoute>} />
          <Route path="/reports-summary" element={<ProtectedRoute><ReportsSummaryPage /></ProtectedRoute>} />
          <Route path="/reports-performance" element={<ProtectedRoute><ReportsPerformancePage /></ProtectedRoute>} />
          <Route path="/reports-exports" element={<ProtectedRoute><ReportsExportsPage /></ProtectedRoute>} />

          {/* Logout (Redirecionamento) */}
          <Route path="/logout" element={<Navigate to="/login" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
