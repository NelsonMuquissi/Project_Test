

import CadastramentoDeUsuario from "../components/dashboard/CadastramentoDeUsuario";
// import ListarUsuariosEmpresa from "../components/dashboard/ListarUsuariosEmpresa";
import DashboardLayout from "./DashboardLayout";
export default function CadastrarUsuarioEmpresa({onLogout}) 
{
    const user = JSON.parse(localStorage.getItem('user'))   
    const username = user?.name || 'Usuário'; 
    return (
        <DashboardLayout  userName={username} onLogout={onLogout}>
            <CadastramentoDeUsuario/>
        </DashboardLayout>
            
     )
}