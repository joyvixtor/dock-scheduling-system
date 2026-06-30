import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { ShoppingCart, Plus, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';

const CREATE_ORDER = gql`
  mutation CreateOrder($sku: String!, $quantity: Int!) {
    createOrder(sku: $sku, quantity: $quantity) {
      id
      sku
      quantity
      status
    }
  }
`;

const GET_ORDERS = gql`
  query GetAllPendingOrders {
    allPendingOrders {
      id
      sku
      quantity
      status
    }
  }
`;

export default function Orders() {
  const { toast } = useToast();
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchSku, setSearchSku] = useState("");

  const [createOrder, { loading: creating }] = useMutation(CREATE_ORDER);

  const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
    fetchPolicy: "network-only",
  } as any);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || !quantity) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    try {
      // Deterministc SKU generation based on the product name: CARNE MOIDA -> SKU-CARNE-MOIDA
      const normalizedName = sku.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').toUpperCase();
      const generatedSku = `SKU-${normalizedName}`;

      await createOrder({
        variables: {
          sku: generatedSku,
          quantity: parseInt(quantity, 10)
        }
      } as any);

      toast({
        title: "Pedido Criado!",
        description: `Backorder de ${quantity}x ${generatedSku} registrado com sucesso.`,
        className: "bg-green-600 text-white border-none",
      });

      setSku("");
      setQuantity("");

      // Wait a moment for the new order to settle, then fetch all
      setTimeout(() => refetch(), 200);
    } catch (err: any) {
      toast({ title: "Erro ao criar", description: err.message, variant: "destructive" });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filtering is done client-side now
  };

  const allOrders = data?.allPendingOrders || [];
  const filteredOrders = searchSku
    ? allOrders.filter((o: any) => o.sku.includes(searchSku))
    : allOrders;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#2f3942] p-6 text-slate-100 flex gap-6">

      {/* Esquerda: Formulário */}
      <div className="w-1/3 flex flex-col gap-6">
        <Card className="bg-[#1e272e] border-slate-700 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Criar Pedido</h1>
          </div>

          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Produto (Nome)</label>
              <input
                type="text"
                placeholder="Ex: Carne Moída"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-[#2f3942] border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all uppercase"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Quantidade Necessária</label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#2f3942] border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={creating}
              className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-6 rounded-lg text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(8,145,178,0.4)]"
            >
              {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Registrar Demanda
            </Button>
          </form>
        </Card>
      </div>

      {/* Direita: Lista de Demandas */}
      <div className="w-2/3 flex flex-col gap-6">
        <Card className="bg-[#1e272e] border-slate-700 p-6 shadow-xl flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-emerald-400" />
              Pedidos Pendentes (Global)
            </h2>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchSku}
                onChange={(e) => setSearchSku(e.target.value.toUpperCase())}
                placeholder="Filtrar SKU..."
                className="bg-[#2f3942] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-emerald-500 outline-none uppercase"
              />
            </form>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-slate-900 border-red-500 text-red-100">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center mb-4">
                <span className="text-slate-300 font-medium">Total de Pedidos na Fila:</span>
                <span className="text-2xl font-black text-emerald-400">{filteredOrders.length}</span>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic">
                  Nenhum pedido pendente encontrado.
                </div>
              ) : (
                filteredOrders.map((order: any) => (
                  <div key={order.id} className="bg-[#242f36] p-4 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-colors flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-xs text-slate-400 mb-1 font-mono">{order.id}</div>
                      <div className="font-bold text-white text-lg">{order.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-white bg-slate-800 px-3 py-1 rounded-md border border-slate-600">
                        {order.quantity} <span className="text-sm font-medium text-slate-400">un.</span>
                      </div>
                      <div className="text-[10px] text-emerald-400 font-bold mt-2 uppercase tracking-widest">{order.status}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
}
