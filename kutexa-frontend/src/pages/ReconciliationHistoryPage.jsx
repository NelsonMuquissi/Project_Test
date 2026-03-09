import ReconciliationHistory from "../components/dashboard/ReconciliationHistory";
import DashboardLayout from "./DashboardLayout";

export default function ReconciliationHistoryPage({ onLogout }) {
    return (
        <DashboardLayout userName="Utilizador" onLogout={onLogout}>
            <ReconciliationHistory />
        </DashboardLayout>
    );
}
