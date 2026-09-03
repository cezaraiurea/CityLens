import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if(!token)
        return <Navigate to="/login" replace />;

    if(role !== 'ROLE_ADMIN')
        return <Navigate to="/home" replace />;

    return children;
};

export default AdminRoute;