"use client";

import { useEffect, useState } from "react";
import {
  getCleanupPreview,
  runCleanup,
  type CleanupPreviewResponse,
  type CleanupRunResponse,
  type CleanupTaskResult,
  type CleanupTaskPreview,
} from "services/routes/cleanup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  Spinner,
} from "flowbite-react";
import { HiRefresh } from "react-icons/hi";
import { MdAutoDelete, MdWarning, MdClose, MdDelete } from "react-icons/md";
import { useToast } from "@/app/context/toast";

export default function CleanupPage() {
  const [preview, setPreview] = useState<CleanupPreviewResponse | null>(null);
  const [results, setResults] = useState<CleanupRunResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [running, setRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { push } = useToast();

  const fetchPreview = async () => {
    setLoadingPreview(true);
    try {
      const data = await getCleanupPreview();
      setPreview(data);
    } catch (err: any) {
      push({ type: "error", message: err.message || "Erro ao carregar preview de limpeza" });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRun = async () => {
    setShowConfirm(false);
    setRunning(true);
    try {
      const data = await runCleanup();
      setResults(data);
      await fetchPreview();
      push({
        type: "success",
        message: `Limpeza concluída. ${data.total_deleted} registros removidos.`,
      });
    } catch (err: any) {
      push({ type: "error", message: err.message || "Erro ao executar limpeza" });
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const totalRecords = preview?.total_records ?? 0;

  return (
    <div className="grid gap-4 p-2">
      {/* Header */}
      <div className="rounded-lg bg-white px-5 py-4 shadow-md">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Limpeza de Dados</h2>
            <p className="mt-1 text-sm text-gray-500">
              Remover registros obsoletos do banco de dados
            </p>
          </div>
          <button
            onClick={fetchPreview}
            disabled={loadingPreview}
            className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-gray-700 disabled:bg-gray-400"
          >
            <HiRefresh className={loadingPreview ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Preview cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loadingPreview
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-gray-200" />
            ))
          : preview?.tasks.map((task) => (
              <TaskCard key={task.task_name} task={task} />
            ))}
      </div>

      {/* Summary + Action */}
      <div className="flex flex-col gap-4 rounded-lg bg-white px-5 py-4 shadow-md md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Total de registros candidatos à limpeza</p>
          <p
            className={`text-4xl font-bold ${
              totalRecords > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {loadingPreview ? "..." : totalRecords.toLocaleString("pt-BR")}
          </p>
          {!loadingPreview && totalRecords === 0 && (
            <p className="mt-1 text-sm text-green-600">Banco de dados sem registros pendentes</p>
          )}
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={running || loadingPreview || totalRecords === 0}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {running ? (
            <>
              <Spinner size="sm" />
              <span className="ml-2">Executando...</span>
            </>
          ) : (
            <>
              <MdAutoDelete className="size-5" />
              Executar Limpeza
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results && <ResultsTable results={results} />}

      {/* Confirm modal */}
      {showConfirm && (
        <ConfirmCleanupModal
          total={totalRecords}
          tasks={preview?.tasks ?? []}
          onConfirm={handleRun}
          onClose={() => setShowConfirm(false)}
          isPending={running}
        />
      )}
    </div>
  );
}

function TaskCard({ task }: { task: CleanupTaskPreview }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-md ring-1 ring-gray-200">
      <p className="text-sm font-medium text-gray-600">{task.description}</p>
      <p
        className={`mt-3 text-3xl font-bold ${
          task.count > 0 ? "text-red-600" : "text-green-600"
        }`}
      >
        {task.count.toLocaleString("pt-BR")}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {task.count === 1 ? "registro candidato" : "registros candidatos"}
      </p>
    </div>
  );
}

function ResultsTable({ results }: { results: CleanupRunResponse }) {
  const executedAt = new Date(results.executed_at).toLocaleString("pt-BR");

  const getStatusBadge = (status: CleanupTaskResult["status"]) => {
    const map = {
      success: { color: "success" as const, label: "Sucesso" },
      error: { color: "failure" as const, label: "Erro" },
      skipped: { color: "warning" as const, label: "Ignorado" },
    };
    const { color, label } = map[status];
    return <Badge color={color}>{label}</Badge>;
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h3 className="font-semibold text-gray-800">Resultado da Última Execução</h3>
          <p className="text-sm text-gray-500">Executado em {executedAt}</p>
        </div>
        <Badge color="red" size="lg">
          {results.total_deleted} removidos
        </Badge>
      </div>
      <Table hoverable theme={{ head: { cell: { base: "bg-white" } } }}>
        <TableHead>
          <TableRow>
            <TableHeadCell>Tarefa</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Registros Removidos</TableHeadCell>
            <TableHeadCell>Duração</TableHeadCell>
            <TableHeadCell>Detalhes</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y divide-gray-200">
          {results.tasks.map((task) => (
            <TableRow key={task.task_name} className="bg-white">
              <TableCell className="font-mono text-sm">{task.task_name}</TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell className="font-semibold">{task.rows_affected}</TableCell>
              <TableCell>{task.duration_seconds.toFixed(2)}s</TableCell>
              <TableCell>
                {task.errors.length > 0 ? (
                  <span className="text-sm text-red-600">{task.errors.join(", ")}</span>
                ) : task.status === "skipped" ? (
                  <span className="text-sm text-gray-400">
                    {(task.details.reason as string) ?? "—"}
                  </span>
                ) : (
                  <span className="text-sm text-green-600">OK</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface ConfirmCleanupModalProps {
  total: number;
  tasks: CleanupTaskPreview[];
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}

function ConfirmCleanupModal({
  total,
  tasks,
  onConfirm,
  onClose,
  isPending,
}: ConfirmCleanupModalProps) {
  return (
    <Modal size="lg" show onClose={onClose} dismissible>
      <ModalHeader className="border-b-2 border-red-100 bg-linear-to-r from-red-50 to-orange-50">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-500 p-2">
            <MdWarning className="size-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">Confirmar Limpeza</span>
        </div>
      </ModalHeader>
      <ModalBody className="p-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4">
            <p className="font-medium text-gray-800">
              Esta ação removerá permanentemente{" "}
              <span className="font-bold text-red-700">
                {total.toLocaleString("pt-BR")}
              </span>{" "}
              registros do banco de dados.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Não é possível desfazer esta operação.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Tarefas a executar:</h4>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.task_name} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{task.description}</span>
                  <Badge color={task.count > 0 ? "red" : "green"}>
                    {task.count} {task.count === 1 ? "registro" : "registros"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button color="gray" className="w-32" onClick={onClose} disabled={isPending}>
              <div className="flex items-center gap-2">
                <MdClose className="size-5" />
                <span>Cancelar</span>
              </div>
            </Button>
            <Button color="red" className="w-36" onClick={onConfirm} disabled={isPending}>
              <div className="flex items-center gap-2">
                <MdDelete className="size-5" />
                <span>{isPending ? "Executando..." : "Confirmar"}</span>
              </div>
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
