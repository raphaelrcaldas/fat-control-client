import { describe, expect, it } from "vitest";
import { formatSize } from "utils/formatSize";

describe("formatSize", () => {
   it("mostra bytes inteiros abaixo de 1 KB", () => {
      expect(formatSize(0)).toBe("0 B");
      expect(formatSize(500)).toBe("500 B");
      expect(formatSize(1023)).toBe("1023 B");
   });

   it("usa vírgula decimal e uma casa a partir de KB", () => {
      expect(formatSize(1024)).toBe("1,0 KB");
      expect(formatSize(29_558)).toBe("28,9 KB");
      expect(formatSize(2.5 * 1024 * 1024)).toBe("2,5 MB");
   });

   it("chega a GB e não mostra 1.024,0 de nenhuma unidade", () => {
      expect(formatSize(1024 ** 3)).toBe("1,0 GB");
      expect(formatSize(1024 * 1024 - 1)).toBe("1,0 MB");
      expect(formatSize(1.2 * 1024 ** 3)).toBe("1,2 GB");
   });
});
