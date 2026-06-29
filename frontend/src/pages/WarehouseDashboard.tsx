import { useQuery, gql } from '@apollo/client';
import { Badge } from '@/components/ui/badge';
import { Loader2, ServerCrash, Truck, Snowflake } from 'lucide-react';
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
      <div className="flex h-full min-h-[calc(100vh-80px)] items-center justify-center bg-[#2f3942]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#2f3942] min-h-[calc(100vh-80px)]">
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

  // Sort by locationY to maintain physical order
  const inboundDocks = [...(data?.activeInboundDocks || [])].sort((a, b) => a.locationY - b.locationY);
  const outboundDocks = [...(data?.activeOutboundDocks || [])].sort((a, b) => a.locationY - b.locationY);

  const availableIn = inboundDocks.filter(d => d.status === 'AVAILABLE').length;
  const occupiedIn = inboundDocks.filter(d => d.status === 'OCCUPIED').length;
  
  const availableOut = outboundDocks.filter(d => d.status === 'AVAILABLE').length;
  const occupiedOut = outboundDocks.filter(d => d.status === 'OCCUPIED').length;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#2f3942] p-8 text-slate-100 font-sans flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Planta do Armazém
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-6">
            Visualização topográfica do pátio logístico.
          </p>
          
          {/* Quick Stats */}
          <div className="flex gap-8 bg-[#1e272e] p-4 rounded-xl border border-slate-700/50 shadow-xl">
            <div className="flex flex-col items-center px-4 border-r border-slate-700/50">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Inbound Disponível</span>
              <span className="text-2xl font-black text-emerald-400">{availableIn}</span>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-slate-700/50">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Inbound Ocupada</span>
              <span className="text-2xl font-black text-amber-400">{occupiedIn}</span>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-slate-700/50">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Outbound Disponível</span>
              <span className="text-2xl font-black text-emerald-400">{availableOut}</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Outbound Ocupada</span>
              <span className="text-2xl font-black text-amber-400">{occupiedOut}</span>
            </div>
          </div>
        </header>

        {/* CSS GRID representing the Warehouse Floor Plan (Scrollable) */}
        <div className="bg-[#1e272e] rounded-3xl border border-slate-700/50 p-6 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[800px] custom-scrollbar relative">
          
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px] opacity-10"></div>

          <div className="relative z-10 w-full flex justify-between gap-12">
            
            {/* INBOUND WALL (Left) */}
            <div className="flex-1 space-y-4">
              <div className="sticky top-0 bg-[#1e272e]/90 backdrop-blur-md py-4 z-20 border-b border-indigo-500/30 mb-6">
                <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  <Truck className="w-5 h-5" />
                  Parede Inbound (Recepção)
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {inboundDocks.map((dock: any) => (
                  <DockCard key={dock.id} dock={dock} type="INBOUND" />
                ))}
              </div>
            </div>

            {/* WAREHOUSE CENTER FLOOR (Decorative Aisle) */}
            <div className="w-32 flex-shrink-0 flex flex-col items-center justify-center border-x border-slate-700/50 bg-slate-800/10 relative">
              <div className="sticky top-1/2 -translate-y-1/2 text-slate-500 font-black text-4xl rotate-90 tracking-[1em] opacity-30 whitespace-nowrap">
                CROSSDOCK
              </div>
            </div>

            {/* OUTBOUND WALL (Right) */}
            <div className="flex-1 space-y-4">
              <div className="sticky top-0 bg-[#1e272e]/90 backdrop-blur-md py-4 z-20 border-b border-fuchsia-500/30 mb-6">
                <h2 className="text-xl font-black text-fuchsia-400 uppercase tracking-widest text-center flex items-center justify-center gap-2">
                  Parede Outbound (Expedição)
                  <Truck className="w-5 h-5 transform scale-x-[-1]" />
                </h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {outboundDocks.map((dock: any) => (
                  <DockCard key={dock.id} dock={dock} type="OUTBOUND" />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function DockCard({ dock, type }: { dock: any, type: 'INBOUND' | 'OUTBOUND' }) {
  const isAvailable = dock.status === 'AVAILABLE';
  const isOccupied = dock.status === 'OCCUPIED';

  const badgeColor = isAvailable ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50" 
    : isOccupied ? "bg-amber-500/10 text-amber-400 border-amber-500/50" 
    : "bg-rose-500/10 text-rose-400 border-rose-500/50";

  const glowClass = isOccupied ? "ring-1 ring-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" : "border-slate-700/50";

  return (
    <div className={`flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border ${glowClass} hover:bg-slate-800 transition-colors group relative overflow-hidden`}>
      {/* Decorative accent line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isAvailable ? 'bg-emerald-500' : isOccupied ? 'bg-amber-500' : 'bg-rose-500'}`}></div>

      <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${type === 'INBOUND' ? 'bg-indigo-500/10' : 'bg-fuchsia-500/10'}`}>
        <Truck className={`w-7 h-7 ${type === 'INBOUND' ? 'text-indigo-400' : 'text-fuchsia-400'} ${isOccupied ? 'opacity-100' : 'opacity-20'} ${type === 'OUTBOUND' ? 'transform scale-x-[-1]' : ''}`} />
      </div>

      <div className="flex-1 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-white">{dock.dockNumber}</h3>
            {dock.isRefrigerated && (
              <span title="Doca Refrigerada" className="bg-cyan-500/20 text-cyan-400 p-1 rounded-md">
                <Snowflake className="w-3 h-3" />
              </span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-500">
            LOC_Y: {dock.locationY}m
          </div>
        </div>

        <Badge variant="outline" className={`px-3 py-1 font-bold ${badgeColor}`}>
          {dock.status}
        </Badge>
      </div>
    </div>
  );
}
