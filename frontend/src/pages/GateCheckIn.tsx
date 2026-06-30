import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Truck, CheckCircle2, Factory, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const GET_DOCKS = gql`
  query GetGateDocks {
    activeInboundDocks {
      id
      dockNumber
      isRefrigerated
      status
    }
    activeOutboundDocks {
      id
      dockNumber
      isRefrigerated
      status
    }
  }
`;

const CREATE_APPOINTMENT = gql`
  mutation CreateAppointment($input: CreateAppointmentInput!) {
    createAppointment(input: $input) {
      id
      status
    }
  }
`;

export default function GateCheckIn() {
  const { data, loading, error } = useQuery(GET_DOCKS);
  const [createAppointment, { loading: submitting }] = useMutation(CREATE_APPOINTMENT);
  const { toast } = useToast();

  const [date, setDate] = useState("29/06/2026"); // DD/MM/YYYY
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [carrier, setCarrier] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dockId, setDockId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex h-full min-h-[calc(100vh-80px)] items-center justify-center bg-[#2f3942]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-[#2f3942] min-h-[calc(100vh-80px)]">
        <Alert variant="destructive" className="bg-slate-900 border-red-500 text-red-100 max-w-lg mx-auto mt-20">
          <AlertTitle>Erro de Conexão</AlertTitle>
          <AlertDescription>Falha ao carregar as docas: {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const inboundDocks = (data?.activeInboundDocks || []).filter((d: any) => d.status === 'AVAILABLE');
  const outboundDocks = (data?.activeOutboundDocks || []).filter((d: any) => d.status === 'AVAILABLE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !carrier || !referenceCode || !sku || !quantity || !dockId) {
      toast({
        title: "Erro de Validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Parse DD/MM/YYYY
      const parts = date.split('/');
      if (parts.length !== 3) {
        toast({ title: "Formato de Data Inválido", description: "Use DD/MM/YYYY", variant: "destructive" });
        return;
      }
      const [day, month, year] = parts;
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

      // Assemble ISO8601 strings in UTC
      const startDateTime = `${isoDate}T${startTime}:00Z`;
      const endDateTime = `${isoDate}T${endTime}:00Z`;

      await createAppointment({
        variables: {
          input: {
            dockId,
            carrier,
            referenceCode,
            sku,
            quantity: parseInt(quantity, 10),
            palletsCount: Math.ceil(parseInt(quantity, 10) / 100),
            startTime: startDateTime,
            endTime: endDateTime
          }
        }
      });

      setIsSuccess(true);
      toast({
        title: "Agendamento Criado!",
        description: `Booking confirmado para ${carrier}. Confira na Agenda.`,
        className: "bg-green-600 text-white border-none",
      });
    } catch (err: any) {
      toast({
        title: "Erro ao Agendar",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-[#2f3942] p-6 text-slate-100">
        <div className="bg-[#1e272e] p-8 rounded-2xl border-2 border-[#10b981] shadow-[0_0_40px_rgba(16,185,129,0.15)] flex flex-col items-center max-w-md w-full text-center transform animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Booking Confirmado!</h2>
          <p className="text-slate-400 mb-8">
            Seu agendamento foi registrado com sucesso na plataforma Davenport.
          </p>
          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="w-full border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
              onClick={() => {
                setIsSuccess(false);
                setCarrier("");
                setReferenceCode("");
                setSku("");
                setQuantity("");
              }}
            >
              Novo Agendamento
            </Button>
            <Link to="/schedule" className="w-full">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20">
                Ver na Agenda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#2f3942] p-8">
      <div className="w-full max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-cyan-500/10 mb-4 ring-1 ring-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <Truck className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-3">Portal de Booking Davenport</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-lg font-medium leading-relaxed">
            Reserve sua Doca (Self-Service). Evite filas agendando online.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-[#1e272e] rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-sm">

          <div className="bg-slate-800/50 px-8 py-5 border-b border-slate-700/50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-200">Novo Agendamento</h3>
          </div>

          <div className="p-8 space-y-8">

            {/* Sec 1: Data e Hora */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 1. Data e Horário
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Data (DD/MM/YYYY)</label>
                  <input
                    type="text"
                    required
                    placeholder="29/06/2026"
                    pattern="\d{2}/\d{2}/\d{4}"
                    title="Formato: DD/MM/YYYY"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Hora Chegada</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Hora Saída</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sec 2: Doca e Carga */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Factory className="w-4 h-4" /> 2. Doca e Carga
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-300">Doca Solicitada</label>
                  <select
                    required
                    value={dockId}
                    onChange={(e) => setDockId(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none"
                  >
                    <option value="" disabled>Selecione a Doca...</option>
                    <optgroup label="Entrada (Inbound)">
                      {inboundDocks.map((d: any) => (
                        <option key={d.id} value={d.id}>Inbound - {d.dockNumber} {d.isRefrigerated ? '(Refrigerada)' : '(Seca)'}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Saída (Outbound)">
                      {outboundDocks.map((d: any) => (
                        <option key={d.id} value={d.id}>Outbound - {d.dockNumber} {d.isRefrigerated ? '(Refrigerada)' : '(Seca)'}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">SKU da Mercadoria</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SKU-9922"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Quantidade</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ex: 500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sec 3: Identificação */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4" /> 3. Identificação Transportadora
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Transportadora</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: FedEx Freight"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Cód. Referência (AWB/BOL)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 4099120"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full bg-[#2f3942] border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="bg-slate-800/80 px-8 py-5 border-t border-slate-700/50 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 px-10 shadow-lg shadow-cyan-500/20 transition-all w-full md:w-auto text-lg rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar Booking'
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
