import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { graphql } from '@/graphql/generated';

const SCAN_INBOUND_PALLET = graphql(`
  mutation ScanInboundPalletCheckIn($sku: String!, $quantity: Int!, $inboundDockId: String!) {
    scanInboundPallet(sku: $sku, quantity: $quantity, inboundDockId: $inboundDockId) {
      id
      sku
      quantity
      inboundDockId
      outboundDockId
      status
    }
  }
`);

export default function GateCheckIn() {
  const { toast } = useToast();
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dockId, setDockId] = useState('');

  const [scanPallet, { loading }] = useMutation(SCAN_INBOUND_PALLET, {
    onCompleted: (data) => {
      const task = data.scanInboundPallet;
      if (task) {
        toast({
          title: "✅ Redirecionamento Detectado!",
          description: `Mover ${task.quantity}x ${task.sku} diretamente para a ${task.outboundDockId}`,
          variant: "default",
        });
        setSku('');
        setQuantity('');
      }
    },
    onError: (error) => {
      toast({
        title: "Fluxo Tradicional (Estocagem)",
        description: `Sem cross-docking imediato. Movimente o palete para as prateleiras regulares. Erro: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!sku || !quantity || !dockId) return;

    scanPallet({
      variables: {
        sku,
        quantity: parseInt(quantity, 10),
        inboundDockId: dockId
      }
    } as any);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="bg-slate-900 text-slate-50 rounded-t-xl mb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">Gate Check-In</CardTitle>
          <CardDescription className="text-slate-300">
            Escaneie o palete inbound para verificar oportunidades de Cross-Docking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="sku" className="text-sm font-semibold text-slate-700">SKU do Produto</label>
              <Input
                id="sku"
                placeholder="Ex: WM-IPAD-PRO-512"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={loading}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quantity" className="text-sm font-semibold text-slate-700">Quantidade Recebida</label>
              <Input
                id="quantity"
                type="number"
                placeholder="Ex: 150"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={loading}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="dock" className="text-sm font-semibold text-slate-700">ID da Doca de Entrada</label>
              <Input
                id="dock"
                placeholder="Ex: DOCK-IN-A01"
                value={dockId}
                onChange={(e) => setDockId(e.target.value)}
                disabled={loading}
                className="uppercase"
              />
            </div>

            <Button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg" disabled={loading}>
              {loading ? "Processando..." : "Escanear Palete"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
