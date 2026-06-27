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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Fila do Operador</h1>
        <Badge variant="secondary" className="text-sm">Operador Logado: {STATIC_OPERATOR_ID}</Badge>
      </div>

      {pendingTasks.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
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
              <Card key={task.id} className={`shadow-md transition-shadow hover:shadow-lg ${isTransit ? 'border-blue-300 bg-blue-50/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold font-mono text-slate-800">{task.sku}</CardTitle>
                    <Badge variant={isTransit ? "default" : "outline"} className={isTransit ? "bg-blue-600" : ""}>
                      {isTransit ? "EM TRÂNSITO" : "AGUARDANDO"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Quantidade:</span>
                    <span className="font-semibold">{task.quantity} cx</span>
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-slate-500 whitespace-nowrap">De (Inbound):</span>
                    <span className="font-semibold text-amber-700 truncate" title={task.inboundDockId}>{task.inboundDockId}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center gap-2">
                    <span className="text-slate-500 whitespace-nowrap">Para (Outbound):</span>
                    <span className="font-semibold text-emerald-700 truncate" title={task.outboundDockId || "A Definir"}>{task.outboundDockId || "A Definir"}</span>
                  </div>
                  {isTransit && (
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t text-slate-500">
                      <span>Operador Responsável:</span>
                      <span className="font-semibold text-slate-700">{task.operatorId}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!isTransit ? (
                    <Button
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                      disabled={assigning || (task.operatorId != null && task.operatorId !== STATIC_OPERATOR_ID)}
                      onClick={() => assignOperator({ variables: { taskId: task.id, operatorId: STATIC_OPERATOR_ID } } as any)}
                    >
                      {assigning ? "Aceitando..." : "Aceitar Movimentação"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
  );
}
