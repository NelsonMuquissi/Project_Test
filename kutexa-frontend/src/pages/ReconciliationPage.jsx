import Reconciliation from "../components/dashboard/ReconciliationChart";
import DashboardLayout from "./DashboardLayout";

export default function ReconciliationPage({ onLogout }) {
  return (
    <DashboardLayout userName="Adilson Fernandes" onLogout={onLogout}>
      <Reconciliation />
    </DashboardLayout>
  );
}