// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PageList from './components/pages/PageList';
import PageDetails from './components/pages/PageDetails';
import DomainManagement from './components/DomainManagement';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

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
                    <Route path="/pages/:id" element={<PageDetails />} />
                    <Route path="/domains" element={<DomainManagement />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;