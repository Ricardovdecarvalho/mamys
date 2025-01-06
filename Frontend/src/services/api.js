// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '@/components/Dashboard';
import PageList from '@/components/pages/PageList';
import PageDetails from '@/components/pages/PageDetails'; // Importe o componente
import Login from '@/components/Login';
import Register from '@/components/Register';
import PrivateRoute from '@/components/PrivateRoute';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Rotas protegidas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/pages" element={<PageList />} />
                    <Route path="/page-details/:id" element={<PageDetails />} /> {/* Nova rota */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;