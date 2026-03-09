import ReconciliationDetails from "../components/dashboard/ReconciliationDetails";
import DashboardLayout from "./DashboardLayout";

export default function ReconciliationDetailsPage({ onLogout }) {
    return (
        <DashboardLayout userName="Utilizador" onLogout={onLogout}>
            <ReconciliationDetails />
        </DashboardLayout>
    );
}
