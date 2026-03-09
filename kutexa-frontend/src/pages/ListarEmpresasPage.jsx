import ListarEmpresas from '../components/dashboard/ListarEmpresas';
import DashboardLayout from './DashboardLayout';

export default function ListarEmpresasPage({onLogout}){
        const user = JSON.parse(localStorage.getItem('user'))
        const token = localStorage.getItem('token'); 
        const name = user?.name || 'Usuário';
 
 
return(
    <DashboardLayout  userName={name} onLogout={onLogout}>
            <ListarEmpresas/>
    </DashboardLayout>
    );
}

 