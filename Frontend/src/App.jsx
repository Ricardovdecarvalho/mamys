import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PageList from './components/pages/PageList';
import PageDetails from './components/pages/PageDetails';
import Login from './components/Login';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pages" element={<PageList />} />
                <Route path="/pages/:id" element={<PageDetails />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;