import { test, expect } from "@playwright/test";

test.describe("Cadastro de Usuário", () => {
   test.beforeEach(async ({ context }) => {
      // Injeta o token de desenvolvimento via cookie para pular o login
      const token = process.env.DEV_TOKEN;
      if (token) {
         await context.addCookies([
            {
               name: "token",
               value: token,
               domain: "localhost",
               path: "/",
            },
         ]);
      }
   });

   test("deve cadastrar um novo usuário com sucesso", async ({ page }) => {
      // 1. Navega para a página de usuários
      await page.goto("/users");

      // 2. Clica no botão "Novo Usuário"
      await page.getByRole("button", { name: /Novo Usuário/i }).click();

      // 3. Verifica se o modal abriu
      await expect(page.getByText("Cadastrar novo usuário")).toBeVisible();

      // 4. Preenche o formulário
      // Identificação
      await page.locator('select[name="p_g"]').selectOption("2t"); // Exemplo: 2º Tenente
      await page.locator('input[name="esp"]').fill("INF");
      await page.locator('input[name="nome_guerra"]').fill("PLAYWRIGHT");
      await page
         .locator('input[name="nome_completo"]')
         .fill("TESTE E2E PLAYWRIGHT");

      // Documentação
      await page.locator('select[name="unidade"]').selectOption("bagl"); // Exemplo: Unidade
      await page.locator('input[name="saram"]').fill("6380000");
      await page.locator('input[name="id_fab"]').fill("765432");
      await page.locator('input[name="cpf"]').fill("12144149747");

      // Contato e Datas
      await page
         .locator('input[name="email_fab"]')
         .fill("teste_e2e@fab.mil.br");
      await page
         .locator('input[name="email_pess"]')
         .fill("teste_e2e@gmail.com");
      await page.locator('input[name="nasc"]').fill("1990-01-01");

      // Carreira
      await page.locator('input[name="ult_promo"]').fill("2023-12-01");
      await page.locator('input[name="ant_rel"]').fill("50");

      // 5. Clica em "Cadastrar"
      await page.getByRole("button", { name: "Cadastrar" }).click();

      // 6. Verifica feedback de sucesso
      // O sistema usa um Toast. Vamos procurar pelo texto de sucesso.
      await expect(
         page.getByText("Usuário Adicionado com sucesso")
      ).toBeVisible();

      // 7. Verifica se o modal fechou
      await expect(page.getByText("Cadastrar novo usuário")).not.toBeVisible();

      // 8. Verifica se o novo usuário aparece na listagem (opcionalmente busca por ele)
      const searchInput = page.locator(
         'input[placeholder*="Buscar por nome de guerra"]'
      );
      await searchInput.fill("PLAYWRIGHT");

      // Aguarda a resposta da API de busca para garantir que a lista atualizou
      await page.waitForResponse(
         (resp) => resp.url().includes("/users/") && resp.status() === 200
      );

      // Usa getByRole('cell') para evitar ambiguidade com outros elementos que contenham o mesmo texto
      await expect(
         page.getByRole("cell", { name: "TESTE E2E PLAYWRIGHT" }).first()
      ).toBeVisible();
   });
});
