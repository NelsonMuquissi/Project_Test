
import Cadastroempresas from "../components/dashboard/Cadastroempresas";
import DashboardLayout from "./DashboardLayout";




export default function CadastroempresasPage({ onLogout }){


    const user = JSON.parse(localStorage.getItem('user'));

    const  username = user?.name || "usuário";
    return(
        <DashboardLayout userName={username} onLogout={onLogout}>
            <Cadastroempresas/>
        </DashboardLayout>
    );
}