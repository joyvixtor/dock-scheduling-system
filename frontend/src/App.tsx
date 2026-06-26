import { Toaster } from '@/components/ui/toaster';
import GateCheckIn from '@/pages/GateCheckIn';

function App() {
  return (
    <>
      {/* 
        Para uma aplicação real com mais páginas, 
        você adicionaria o react-router-dom aqui.
        Por enquanto, renderizamos a página principal pedida na Fase 3.
      */}
      <GateCheckIn />
      <Toaster />
    </>
  );
}

export default App;
