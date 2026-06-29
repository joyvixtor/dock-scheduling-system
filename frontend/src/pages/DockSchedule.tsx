import { useQuery, gql } from '@apollo/client';
import { Loader2, ServerCrash, Calendar as CalendarIcon, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GET_SCHEDULE = gql`
  query GetSchedule($date: String!) {
    activeInboundDocks {
      id
      dockNumber
      isRefrigerated
    }
    activeOutboundDocks {
      id
      dockNumber
      isRefrigerated
    }
    appointmentsByDate(date: $date) {
      id
      dockId
      carrier
      referenceCode
      startTime
      endTime
      palletsCount
      status
    }
  }
`;

export default function DockSchedule() {
  // Using the mocked date from our DB seed for demonstration
  const currentDate = "2026-06-29"; 
  
  const { data, loading, error } = useQuery(GET_SCHEDULE, {
    variables: { date: currentDate },
    pollInterval: 5000,
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
            Não foi possível carregar a agenda. {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Combine docks and sort them somehow. Let's do Inbound first, then Outbound.
  const inbound = data?.activeInboundDocks || [];
  const outbound = data?.activeOutboundDocks || [];
  const allDocks = [...inbound, ...outbound];

  const appointments = data?.appointmentsByDate || [];

  // Define time range (e.g. 7 AM to 6 PM) in 15 minute increments.
  const startHour = 7;
  const endHour = 18;
  const timeSlots: string[] = [];
  
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      timeSlots.push(`${hh}:${mm}`);
    }
  }

  // Helper to calculate grid row based on time string (e.g., "2026-06-29T07:15:00Z")
  const getGridRow = (timeIsoString: string) => {
    const date = new Date(timeIsoString);
    const h = date.getUTCHours();
    const m = date.getUTCMinutes();
    
    // Check if outside range
    if (h < startHour || h > endHour) return -1;
    
    // Calculate 15-min blocks from startHour
    // +2 because Row 1 is header
    const rowOffset = ((h - startHour) * 4) + Math.floor(m / 15) + 2; 
    return rowOffset;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#354350] p-4 text-slate-100 font-sans flex flex-col">
      {/* Header bar mimicking Shiptify */}
      <div className="flex items-center justify-between bg-[#1e272e] p-3 rounded-t-lg border-b-4 border-cyan-500 shadow-md">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            Agenda de Docas
          </h2>
          <span className="text-slate-400 text-sm font-medium">| {currentDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
           <div className="w-3 h-3 bg-[#10b981] rounded-full"></div> SCHEDULED
           <div className="w-3 h-3 bg-[#3b82f6] rounded-full ml-3"></div> ARRIVED
           <div className="w-3 h-3 bg-[#64748b] rounded-full ml-3"></div> COMPLETED
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="flex-1 bg-[#2f3942] rounded-b-lg overflow-x-auto overflow-y-auto border border-slate-700 shadow-2xl relative">
        
        <div 
          className="min-w-max" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `80px repeat(${allDocks.length}, minmax(180px, 1fr))`,
            gridTemplateRows: `50px repeat(${timeSlots.length}, 40px)`
          }}
        >
          {/* Top-Left Empty Corner */}
          <div className="bg-[#1e272e] sticky top-0 left-0 z-30 border-r border-b border-slate-700"></div>

          {/* Docks Header Row */}
          {allDocks.map((dock, index) => (
            <div 
              key={dock.id} 
              className="bg-[#242f36] sticky top-0 z-20 border-r border-b border-slate-700 flex flex-col items-center justify-center py-2"
              style={{ gridColumn: index + 2, gridRow: 1 }}
            >
              <div className="text-sm font-bold text-white tracking-wide">{dock.dockNumber}</div>
              <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">
                {dock.dockNumber.includes('IN') ? 'Inbound' : 'Outbound'} {dock.isRefrigerated ? '❄️' : ''}
              </div>
            </div>
          ))}

          {/* Time Slots (Y-Axis Header) */}
          {timeSlots.map((time, index) => (
            <div 
              key={time} 
              className="bg-[#1e272e] sticky left-0 z-10 border-r border-b border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300"
              style={{ gridColumn: 1, gridRow: index + 2 }}
            >
              {time}
            </div>
          ))}

          {/* Background Grid Cells */}
          {timeSlots.map((_, rowIndex) => (
            allDocks.map((_, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`} 
                className="border-r border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                style={{ gridColumn: colIndex + 2, gridRow: rowIndex + 2 }}
              ></div>
            ))
          ))}

          {/* Render Appointments */}
          {appointments.map((appt: any) => {
            const startRow = getGridRow(appt.startTime);
            const endRow = getGridRow(appt.endTime);
            const colIndex = allDocks.findIndex(d => d.id === appt.dockId);
            
            // Safety check if dock or time is out of grid
            if (colIndex === -1 || startRow === -1 || endRow === -1) return null;

            const bgClass = appt.status === 'SCHEDULED' ? 'bg-[#10b981]' // Green
              : appt.status === 'ARRIVED' ? 'bg-[#3b82f6]' // Blue
              : appt.status === 'COMPLETED' ? 'bg-[#64748b]' // Gray
              : 'bg-[#ef4444]'; // Red (Cancelled)

            return (
              <div
                key={appt.id}
                className={`${bgClass} m-[2px] rounded border border-black/20 shadow-sm overflow-hidden flex flex-col p-1.5 hover:brightness-110 cursor-pointer transition-all hover:scale-[1.02] hover:z-40 hover:shadow-xl`}
                style={{
                  gridColumn: colIndex + 2,
                  gridRow: `${startRow} / ${endRow}`,
                  zIndex: 15
                }}
              >
                {/* Appointment Header */}
                <div className="flex justify-between items-start mb-1">
                  <div className="text-[10px] font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">
                    {appt.referenceCode}
                  </div>
                </div>
                {/* Carrier info */}
                <div className="text-xs font-extrabold text-white leading-tight truncate">
                  {appt.carrier}
                </div>
                {/* Details Footer */}
                <div className="mt-auto flex items-center gap-1 text-[10px] font-medium text-white/90">
                  <Package className="w-3 h-3" />
                  {appt.palletsCount} PLT
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
