// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useIndispFormState } from "@/app/(home)/ops/indisp/components/form/hooks/useIndispFormState";
import type { IndispType } from "services/routes/indisps";

afterEach(cleanup);

describe("formulário de indisponibilidade", () => {
   it("mantém o fim no mesmo dia quando o início avança", () => {
      const { result } = renderHook(() =>
         useIndispFormState(null, "2026-09-11")
      );
      act(() => result.current.setField("dateStart", "2026-10-01"));
      expect(result.current.values.dateEnd).toBe("2026-10-01");
   });

   it("exige motivo e datas e recusa intervalo invertido", () => {
      const { result } = renderHook(() =>
         useIndispFormState(null, "2026-09-11")
      );
      expect(result.current.validate()).toContain("- Escolha um motivo");
      act(() => {
         result.current.setField("mtv", "pes");
         result.current.setField("dateEnd", "2026-09-10");
      });
      expect(result.current.validate()).toContain(
         "- A data de início não deve ser maior que a data final"
      );
      act(() => result.current.setField("dateStart", ""));
      expect(result.current.validate()).toContain(
         "- Insira uma data de início válida!"
      );
   });

   it("envia null para observações vazias na criação", () => {
      const { result } = renderHook(() =>
         useIndispFormState(null, "2026-09-11")
      );
      act(() => {
         result.current.setField("mtv", "pes");
         result.current.setField("obs", "   ");
      });
      expect(result.current.buildPayload(7)).toMatchObject({
         user_id: 7,
         obs: null,
         date_start: "2026-09-11",
         date_end: "2026-09-11",
      });
   });

   it("limpa observação existente sem reenviar campos inalterados", () => {
      const record: IndispType = {
         id: 42,
         mtv: "pes",
         date_start: "2026-09-11",
         date_end: "2026-09-13",
         obs: "Detalhes",
      };
      const { result } = renderHook(() => useIndispFormState(record));
      act(() => result.current.setField("obs", ""));
      expect(result.current.buildPayload(7)).toEqual({ id: 42, obs: null });
   });
});
