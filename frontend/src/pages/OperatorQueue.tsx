import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { graphql } from '@/graphql/generated';

const ACTIVE_TRANSFER_TASKS = graphql(`
  query GetActiveTransferTasks {
    activeTransferTasks {
      id
      sku
      quantity
      inboundDockId
      outboundDockId
      status
      operatorId
      createdAt
    }
  }
`);

const ASSIGN_OPERATOR = graphql(`
  mutation AssignOperatorToTask($taskId: ID!, $operatorId: ID!) {
    assignOperator(taskId: $taskId, operatorId: $operatorId) {
      id
      status
      operatorId
    }
  }
`);

const COMPLETE_TRANSFER = graphql(`
  mutation CompleteTransferTask($taskId: ID!) {
    completeTransfer(taskId: $taskId) {
      id
      status
    }
  }
`);

const STATIC_OPERATOR_ID = "OP-001";

export default function OperatorQueue() {
  const { toast } = useToast();

  const { data, loading, error, refetch } = useQuery(ACTIVE_TRANSFER_TASKS, {
    pollInterval: 2000,
    fetchPolicy: 'cache-and-network',
  } as any);

  const [assignOperator, { loading: assigning }] = useMutation(ASSIGN_OPERATOR, {
    onCompleted: () => {
      toast({
        title: "Tarefa Aceita",
        description: "Dirija-a para a doca de saída indicada.",
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: "Erro ao aceitar",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  const [completeTransfer, { loading: completing }] = useMutation(COMPLETE_TRANSFER, {
    onCompleted: () => {
      toast({
        title: "Transferência Concluída",
        description: "Palete entregue com sucesso!",
        variant: "default",
      });
      refetch();
    },
    onError: (err) => {
      toast({
        title: "Erro ao concluir",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  if (loading && !data) {
    return <div className="flex justify-center items-center h-64 text-slate-500">Carregando fila de tarefas...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Erro ao carregar fila: {error.message}</div>;
  }

  const tasks = data?.activeTransferTasks || [];
  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#2f3942] p-6 text-slate-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Fila do Operador</h1>
          <Badge variant="secondary" className="text-sm bg-slate-800 text-cyan-400 border border-slate-700 hover:bg-slate-700">Operador Logado: {STATIC_OPERATOR_ID}</Badge>
        </div>

      {pendingTasks.length === 0 ? (
        <Card className="bg-[#1e272e] border-dashed border-slate-700 shadow-xl">
          <CardContent className="flex flex-col items-center justify-center h-48 text-slate-400">
            <p className="text-lg">Nenhuma tarefa pendente no momento.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingTasks.map((task) => {
            const isAssignedToMe = task.operatorId === STATIC_OPERATOR_ID;
            const isTransit = task.status === 'TRANSIT';

            return (
              <Card key={task.id} className={`shadow-xl transition-all hover:scale-[1.02] border-slate-700/50 ${isTransit ? 'border-blue-500/50 bg-blue-900/20' : 'bg-[#1e272e]'}`}>
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold font-mono text-white">{task.sku}</CardTitle>
                    <Badge variant={isTransit ? "default" : "outline"} className={isTransit ? "bg-blue-600 text-white border-none shadow-lg shadow-blue-500/20" : "text-slate-300 border-slate-600"}>
                      {isTransit ? "EM TRÂNSITO" : "AGUARDANDO"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Quantidade:</span>
                    <span className="font-semibold text-slate-200">{task.quantity} cx</span>
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-slate-400 whitespace-nowrap">De (Inbound):</span>
                    <span className="font-semibold text-indigo-400 truncate" title={task.inboundDockId}>{task.inboundDockId}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-slate-400 whitespace-nowrap">Para (Outbound):</span>
                    <span className="font-semibold text-fuchsia-400 truncate" title={task.outboundDockId || "A Definir"}>{task.outboundDockId || "A Definir"}</span>
                  </div>
                  {isTransit && (
                    <div className="flex justify-between text-xs mt-3 pt-3 border-t border-slate-800 text-slate-400">
                      <span>Operador Responsável:</span>
                      <span className="font-semibold text-cyan-400">{task.operatorId}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  {!isTransit ? (
                    <Button
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors shadow-lg shadow-cyan-500/10"
                      disabled={assigning || (task.operatorId != null && task.operatorId !== STATIC_OPERATOR_ID)}
                      onClick={() => assignOperator({ variables: { taskId: task.id, operatorId: STATIC_OPERATOR_ID } } as any)}
                    >
                      {assigning ? "Aceitando..." : "Aceitar Movimentação"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg shadow-emerald-500/10"
                      disabled={completing || !isAssignedToMe}
                      onClick={() => completeTransfer({ variables: { taskId: task.id } } as any)}
                    >
                      {completing ? "Confirmando..." : "Confirmar Entrega na Doca"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
