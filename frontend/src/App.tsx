import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DevisPage from './pages/DevisPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/devis" replace />} />
        <Route path="/devis" element={<DevisPage />} />
      </Routes>
    </BrowserRouter>
  );
}
