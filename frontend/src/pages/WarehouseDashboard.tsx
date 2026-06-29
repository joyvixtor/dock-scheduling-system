import { useQuery, gql } from '@apollo/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ServerCrash, Truck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GET_ALL_DOCKS = gql`
  query GetAllDocks {
    activeInboundDocks {
      id
      dockNumber
      isRefrigerated
      status
      locationX
      locationY
    }
    activeOutboundDocks {
      id
      dockNumber
      isRefrigerated
      status
      locationX
      locationY
    }
  }
`;

export default function WarehouseDashboard() {
  const { data, loading, error } = useQuery(GET_ALL_DOCKS, {
    pollInterval: 3000,
  } as any);

  if (loading && !data) {
    return (
      <div className="flex h-full min-h-[calc(100vh-80px)] items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-slate-950 min-h-[calc(100vh-80px)]">
        <Alert variant="destructive" className="max-w-2xl mx-auto bg-slate-900 border-red-500 text-red-100">
          <ServerCrash className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-400 font-bold">Erro de Conexão</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as docas do Gateway GraphQL. {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 p-8 text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
            Centro de Comando Logístico
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Visão espacial em tempo real de todas as docas Inbound e Outbound espalhadas pela planta (malha) do armazém.
          </p>
        </header>

        {/* CSS GRID representing the Warehouse Floor Plan */}
        <div className="relative bg-slate-900/50 rounded-3xl border border-slate-800 p-8 backdrop-blur-xl shadow-2xl overflow-hidden min-h-[600px]">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>

          {/* Docks Container */}
          <div className="relative z-10 w-full h-full">
            {/* INBOUND DOCKS */}
            {data?.activeInboundDocks.map((dock: any) => (
              <DockPin 
                key={dock.id} 
                dock={dock} 
                type="INBOUND" 
                // We'll map Y roughly into top percent and X into left percent for the grid
              />
            ))}

            {/* OUTBOUND DOCKS */}
            {data?.activeOutboundDocks.map((dock: any) => (
              <DockPin 
                key={dock.id} 
                dock={dock} 
                type="OUTBOUND" 
              />
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Subcomponent for the visual representation of a dock
function DockPin({ dock, type }: { dock: any, type: 'INBOUND' | 'OUTBOUND' }) {
  // Convert coordinates to CSS absolute positioning.
  // Assuming warehouse height represents Y (0 to 100) and width represents X (0 to 100).
  // In our DB seeds: Inbound X=0, Y=(10,20,30,etc). Outbound X=0 (wait, X=0 for both?)
  // Let's force Inbound to the LEFT side (left=5%) and Outbound to RIGHT side (left=80%).
  
  const topPos = `${Math.min(Math.max(dock.locationY, 5), 85)}%`;
  const leftPos = type === 'INBOUND' ? '5%' : '80%';

  const isAvailable = dock.status === 'AVAILABLE';
  const isOccupied = dock.status === 'OCCUPIED';

  const badgeColor = isAvailable ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
    : isOccupied ? "bg-amber-500/20 text-amber-400 border-amber-500/50" 
    : "bg-rose-500/20 text-rose-400 border-rose-500/50";

  const glowColor = isAvailable ? "shadow-[0_0_30px_rgba(16,185,129,0.3)]" 
    : isOccupied ? "shadow-[0_0_30px_rgba(245,158,11,0.3)]"
    : "shadow-[0_0_30px_rgba(244,63,94,0.3)]";

  return (
    <div 
      className={`absolute flex items-center group transition-all duration-500 ease-out hover:z-50 hover:scale-110`}
      style={{ top: topPos, left: leftPos }}
    >
      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border ${
          type === 'INBOUND' ? 'bg-indigo-900/40 border-indigo-500/30 text-indigo-400' : 'bg-fuchsia-900/40 border-fuchsia-500/30 text-fuchsia-400'
        } backdrop-blur-md cursor-pointer ${glowColor} transition-all relative`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{type === 'INBOUND' ? 'IN' : 'OUT'}</span>
        <Truck className={`w-6 h-6 ${isOccupied ? 'opacity-100' : 'opacity-20'} transition-opacity`} />
        
        {/* Dock Number Badge attached to the pin */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 text-xs font-mono font-bold whitespace-nowrap shadow-xl text-white">
          {dock.dockNumber}
        </div>
      </div>
      
      {/* Connector Line (decorative) */}
      <div className={`h-0.5 w-12 ${type === 'INBOUND' ? 'bg-indigo-500/20 ml-4' : 'bg-fuchsia-500/20 order-first mr-4'} group-hover:w-16 transition-all`}></div>

      {/* Floating Info Card (appears on hover) */}
      <div className={`absolute ${type === 'INBOUND' ? 'left-[100px]' : 'right-[100px]'} top-1/2 -translate-y-1/2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform group-hover:translate-x-0 ${type === 'INBOUND' ? '-translate-x-4' : 'translate-x-4'}`}>
        <Card className="bg-slate-900/90 border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className={`h-1 w-full ${isAvailable ? 'bg-emerald-500' : isOccupied ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
          <CardHeader className="pb-2 pt-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-slate-200 text-lg">{dock.dockNumber}</CardTitle>
              <Badge variant="outline" className={badgeColor}>{dock.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="text-slate-200 font-medium">{type}</span>
              </div>
              <div className="flex justify-between">
                <span>Refrigerada:</span>
                <span className="text-slate-200 font-medium">{dock.isRefrigerated ? 'Sim ❄️' : 'Não'}</span>
              </div>
              <div className="flex justify-between font-mono text-xs mt-3 pt-3 border-t border-slate-800">
                <span>COORDENADAS</span>
                <span className="text-cyan-400">X:{dock.locationX} Y:{dock.locationY}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
