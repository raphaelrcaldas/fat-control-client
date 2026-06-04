import request from "../Api";
import type { ApiResponse } from "@/types/api";

const cleanupRoute = "admin/cleanup/";

export interface CleanupTaskPreview {
  task_name: string;
  description: string;
  count: number;
}

export interface CleanupPreviewResponse {
  tasks: CleanupTaskPreview[];
  total_records: number;
}

export interface CleanupTaskResult {
  task_name: string;
  status: "success" | "error" | "skipped";
  rows_affected: number;
  duration_seconds: number;
  errors: string[];
  details: Record<string, unknown>;
}

export interface CleanupRunResponse {
  tasks: CleanupTaskResult[];
  total_deleted: number;
  executed_at: string;
}

export async function getCleanupPreview(): Promise<CleanupPreviewResponse> {
  const res = await request("GET", `${cleanupRoute}preview`);
  const json = (await res.json()) as ApiResponse<CleanupPreviewResponse>;
  if (!res.ok) throw new Error(json.message || "Erro ao buscar preview de limpeza");
  return json.data!;
}

export async function runCleanup(): Promise<CleanupRunResponse> {
  const res = await request("POST", `${cleanupRoute}run`);
  const json = (await res.json()) as ApiResponse<CleanupRunResponse>;
  if (!res.ok) throw new Error(json.message || "Erro ao executar limpeza");
  return json.data!;
}
