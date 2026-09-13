import { beforeEach, describe, expect, it, vi } from "vitest";

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock("services/Api", () => ({ default: requestMock }));

const { getAllUserActionLogs } = await import("services/routes/logs");

function response(page: number, pages: number, ids: number[]) {
   return {
      ok: true,
      json: async () => ({
         status: "success",
         data: ids.map((id) => ({ id })),
         message: null,
         errors: null,
         timestamp: "2026-09-13T12:00:00",
         total: 3,
         page,
         per_page: 100,
         pages,
         total_items: 3,
      }),
   };
}

beforeEach(() => requestMock.mockReset());

describe("paginação do histórico individual", () => {
   it("carrega todas as páginas sem truncar eventos antigos", async () => {
      requestMock
         .mockResolvedValueOnce(response(1, 2, [3, 2]))
         .mockResolvedValueOnce(response(2, 2, [1]));

      const logs = await getAllUserActionLogs({
         resource: "users",
         resource_id: 317,
      });

      expect(logs.map((item) => item.id)).toEqual([3, 2, 1]);
      expect(requestMock).toHaveBeenCalledTimes(2);
      expect(requestMock.mock.calls[0][3]).toMatchObject({
         page: 1,
         per_page: 100,
      });
      expect(requestMock.mock.calls[1][3]).toMatchObject({
         page: 2,
         per_page: 100,
      });
   });

   it("faz uma única chamada quando tudo cabe na primeira página", async () => {
      requestMock.mockResolvedValueOnce(response(1, 1, [3, 2, 1]));

      const logs = await getAllUserActionLogs({
         resource: "users",
         resource_id: 317,
      });

      expect(logs.map((item) => item.id)).toEqual([3, 2, 1]);
      expect(requestMock).toHaveBeenCalledTimes(1);
   });

   it("remove duplicata quando um id aparece em duas páginas", async () => {
      // Log inserido entre a busca da página 1 e da página 2 desloca um item
      // de uma página para a outra — o id 2 aparece nas duas respostas.
      requestMock
         .mockResolvedValueOnce(response(1, 2, [4, 3]))
         .mockResolvedValueOnce(response(2, 2, [3, 2]));

      const logs = await getAllUserActionLogs({
         resource: "users",
         resource_id: 317,
      });

      expect(logs.map((item) => item.id)).toEqual([4, 3, 2]);
   });
});
