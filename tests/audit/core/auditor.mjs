import path from "node:path";

/**
 * Orquestrador. Nao conhece nenhuma metrica nem nenhum formato de saida: roda a
 * lista de coletores que recebeu em cada breakpoint e entrega o resultado aos
 * reporters que recebeu.
 *
 * Contratos:
 *   Collector = { name, initScript?, collect({ page, breakpoint }) -> data,
 *                 render(data) -> { rows?: [label, valor][], sections?: [{ title, items: string[] }] } }
 *   Reporter  = { emit({ report, outDir }) }
 *
 * Metrica nova = um arquivo em collectors/ registrado no composition root.
 * Nada aqui muda.
 */
export async function runAudit({
   session,
   breakpoints,
   collectors,
   reporters,
   outDir,
   meta,
   logger = console,
}) {
   const report = {
      ...meta,
      timestamp: new Date().toISOString(),
      breakpoints: [],
   };

   await session.start();

   try {
      for (const breakpoint of breakpoints) {
         const measurement = await measure({
            session,
            breakpoint,
            collectors,
            outDir,
            logger,
         });
         report.breakpoints.push(measurement);
      }
   } finally {
      await session.stop();
   }

   for (const reporter of reporters) await reporter.emit({ report, outDir });

   return report;
}

async function measure({ session, breakpoint, collectors, outDir, logger }) {
   const measurement = {
      name: breakpoint.name,
      viewport: `${breakpoint.width}x${breakpoint.height}`,
      results: [],
   };

   let handle;
   try {
      handle = await session.open(breakpoint);
   } catch (error) {
      logger.error(
         `[audit] ${breakpoint.name}: falhou ao abrir — ${error.message}`
      );
      return { ...measurement, error: error.message };
   }

   try {
      for (const collector of collectors) {
         // Um coletor que quebra nao pode levar a auditoria inteira junto.
         try {
            const data = await collector.collect({
               page: handle.page,
               breakpoint,
            });
            measurement.results.push({
               name: collector.name,
               data,
               view: collector.render(data),
            });
         } catch (error) {
            measurement.results.push({
               name: collector.name,
               error: error.message,
            });
            logger.error(
               `[audit] ${breakpoint.name}/${collector.name}: ${error.message}`
            );
         }
      }

      // Screenshot DEPOIS dos coletores, de proposito. Em pagina mais alta que
      // a viewport, `fullPage: true` reemite `Emulation.setDeviceMetricsOverride`
      // no Chromium e derruba a emulacao de toque — o que sobrava era medir
      // alvos com `pointer: fine` e rotular o resultado como "coarse (dedo)",
      // porque o rotulo vem da config, nao do que foi medido. Isso produzia
      // alvos de 32px falsos em toda rota com rolagem.
      const screenshot = path.join(outDir, `${breakpoint.name}.png`);
      await handle.page.screenshot({ path: screenshot, fullPage: true });
      measurement.screenshot = screenshot;
   } finally {
      await handle.close();
   }

   return measurement;
}
