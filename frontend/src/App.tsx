import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import GateCheckIn from '@/pages/GateCheckIn';
import OperatorQueue from '@/pages/OperatorQueue';
import WarehouseDashboard from '@/pages/WarehouseDashboard';
import DockSchedule from '@/pages/DockSchedule';
import Orders from '@/pages/Orders';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-slate-900 text-white p-4 shadow-md flex gap-4">
        <Link to="/">
          <Button variant="ghost" className="text-white hover:text-slate-900">Terminal de Entrada</Button>
        </Link>
        <Link to="/operator">
          <Button variant="ghost" className="text-white hover:text-slate-900">Fila do Operador</Button>
        </Link>
        <Link to="/schedule">
          <Button variant="ghost" className="text-white hover:text-slate-900">Agenda</Button>
        </Link>
        <Link to="/orders">
          <Button variant="ghost" className="text-white hover:text-slate-900">Pedidos de Clientes</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="ghost" className="text-white hover:text-slate-900">Visão Geral (Armazém)</Button>
        </Link>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<GateCheckIn />} />
          <Route path="/operator" element={<OperatorQueue />} />
          <Route path="/schedule" element={<DockSchedule />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/dashboard" element={<WarehouseDashboard />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
