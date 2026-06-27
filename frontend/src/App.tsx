import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import GateCheckIn from '@/pages/GateCheckIn';
import OperatorQueue from '@/pages/OperatorQueue';

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
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<GateCheckIn />} />
          <Route path="/operator" element={<OperatorQueue />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
