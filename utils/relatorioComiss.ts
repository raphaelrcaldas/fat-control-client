"use client"

import ExcelJS from "exceljs";
import { ComissWithMiss } from "services/routes/cegep/comiss";

function autoSizeColumn(colNumber: number, sheet: ExcelJS.Worksheet) {
    const col = sheet.getColumn(colNumber);

    let maxLength = 0;
    col.eachCell({ includeEmpty: false }, cell => {
        const cellValue = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, cellValue.length);
    });
    col.width = maxLength + 5;
}

function createHeader(sheet: ExcelJS.Worksheet) {
    sheet.mergeCells("A2:A3");
    const postoGrad = sheet.getCell("A2");
    postoGrad.value = "POSTO/GRAD";
    sheet.getColumn(1).width = 14;

    sheet.mergeCells("B2:B3");
    const nomeCompleto = sheet.getCell("B2");
    nomeCompleto.value = "NOME COMPLETO"
    // AUTORESIZE

    sheet.mergeCells("C2:C3");
    const saram = sheet.getCell("C2");
    saram.value = "SARAM";
    sheet.getColumn(3).width = 10;

    sheet.mergeCells("D2:D3");
    const possuiDep = sheet.getCell("D2");
    possuiDep.value = "POSSUI DEP?";
    possuiDep.alignment = { textRotation: 90, wrapText: true }
    sheet.getColumn(4).width = 8;

    sheet.mergeCells("E2:F2");
    sheet.getCell("E2").value = "MÓDULOS";

    sheet.getCell("E3").value = "INÍCIO";
    sheet.getColumn(5).width = 14;
    sheet.getCell("F3").value = "TÉRMINO";
    sheet.getColumn(6).width = 14;

    sheet.mergeCells("G2:G3");
    const nDias = sheet.getCell("G2");
    nDias.value = "Nº DE DIAS";
    nDias.alignment = { textRotation: 90, wrapText: true }
    sheet.getColumn(7).width = 10;

    sheet.mergeCells("H2:H3");
    const totalDias = sheet.getCell("H2");
    totalDias.value = "TOTAL DE DIAS";
    totalDias.alignment = { textRotation: 90, wrapText: true }
    sheet.getColumn(8).width = 10;

    sheet.mergeCells("I2:I3");
    const nDiarias = sheet.getCell("I2");
    nDiarias.value = "Nº DE DIÁRIAS";
    nDiarias.alignment = { textRotation: 90, wrapText: true }
    sheet.getColumn(9).width = 10;

    sheet.mergeCells("J2:J3");
    const totalDiarias = sheet.getCell("J2");
    totalDiarias.value = "TOTAL DE DIÁRIAS";
    totalDiarias.alignment = { textRotation: 90, wrapText: true }
    sheet.getColumn(10).width = 10;

    sheet.mergeCells("K2:K3");
    const servico = sheet.getCell("K2");
    servico.value = "MISSÃO E LOCAL DE REALIZAÇÃO DO SERVIÇO"
    // AUTORESIZE

    sheet.mergeCells("L2:L3");
    const qtdAjudaCusto = sheet.getCell("L2");
    qtdAjudaCusto.value = "QTD AJUDA CUSTO";
    qtdAjudaCusto.alignment = { wrapText: true }
    sheet.getColumn(12).width = 12;

    sheet.mergeCells("M2:M3");
    const valAjudaCustoAb = sheet.getCell("M2");
    valAjudaCustoAb.value = "VALOR DA AJUDA DE CUSTO DA ABERTURA";
    valAjudaCustoAb.alignment = { wrapText: true }
    sheet.getColumn(13).width = 15;

    sheet.mergeCells("N2:N3");
    const valAjudaCustoFc = sheet.getCell("N2");
    valAjudaCustoFc.value = "VALOR DA AJUDA DE CUSTO DO FECHAMENTO";
    valAjudaCustoFc.alignment = { wrapText: true }
    sheet.getColumn(14).width = 15;

    sheet.mergeCells("O2:O3");
    const valAjudaCustoTotal = sheet.getCell("O2");
    valAjudaCustoTotal.value = "VALOR DA AJUDA DE CUSTO TOTAL";
    valAjudaCustoTotal.alignment = { wrapText: true }
    sheet.getColumn(15).width = 15;

    sheet.mergeCells("P2:P3");
    const valDiaria = sheet.getCell("P2");
    valDiaria.value = "VALOR DA DIÁRIA";
    valDiaria.alignment = { wrapText: true }
    sheet.getColumn(16).width = 15;

    sheet.mergeCells("Q2:Q3");
    const valTotalDiaria = sheet.getCell("Q2");
    valTotalDiaria.value = "VALOR TOTAL DA DIÁRIA";
    valTotalDiaria.alignment = { wrapText: true }
    sheet.getColumn(17).width = 15;

    const headerRows = sheet.getRows(2, 2);
    headerRows.forEach(row => {
        row.height = 25;
        row.eachCell({ includeEmpty: false }, (cell => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: "ffcccccc" }
            }
        }))
    })
}

function r1c1ToA1(row: number, col: number) {
    const letters = [];
    while (col > 0) {
        const mod = (col - 1) % 26;
        letters.unshift(String.fromCharCode(65 + mod));
        col = Math.floor((col - mod) / 26);
    }
    return letters.join('') + row;
}

export async function gerarRelatorio(comiss: ComissWithMiss) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet();

    createHeader(sheet);

    // Inserir dados
    const user = comiss.user;
    const missoes = comiss.missoes;

    const startRowData = 4;
    const totalRows = (3 + missoes.length);

    sheet.getCell("A4").value = `${user.posto.short} ${user.esp}`.toUpperCase()
    sheet.mergeCells(startRowData, 1, totalRows, 1)

    sheet.getCell("B4").value = user.nome_completo.toUpperCase();
    sheet.mergeCells(startRowData, 2, totalRows, 2)
    autoSizeColumn(2, sheet);

    sheet.getCell("C4").value = user.saram;
    sheet.mergeCells(startRowData, 3, totalRows, 3)

    sheet.getCell("D4").value = comiss.dep ? "SIM" : "NÃO";
    sheet.mergeCells(startRowData, 4, totalRows, 4)

    missoes.forEach((m, index) => {
        const row = startRowData + index;
        // inicio
        const afastZero = new Date(m.afast).setHours(0, 0);
        const afast = new Date(afastZero);
        sheet.getCell(row, 5).value = afast;
        sheet.getCell(row, 5).numFmt = 'dd/mm/yyyy';

        // termino
        const daysToSum = m.dias - 1;
        const regres = new Date(afast.getTime() + (daysToSum * 24 * 60 * 60 * 1000));
        sheet.getCell(row, 6).value = regres;
        sheet.getCell(row, 6).numFmt = 'dd/mm/yyyy';

        // n_dias
        const n_dias = sheet.getCell(r1c1ToA1(row, 7));
        n_dias.numFmt = "#";
        n_dias.value = {
            formula: `${r1c1ToA1(row, 6)}-${r1c1ToA1(row, 5)}+1`,
        };

        // n_diarias
        const n_diarias = sheet.getCell(r1c1ToA1(row, 9));
        n_diarias.numFmt = "0.0";
        n_diarias.value = {
            formula: `${r1c1ToA1(row, 7)}-${m.diarias % 1}`
        };

        // miss e local do svc
        let misStr = `${m.tipo_doc} ${m.n_doc} `;
        if (m.obs) misStr += `- ${m.obs}`;
        misStr += `- Missão ${m.tipo} - `

        let listPntsStrFml: string[] = [];
        if (m.acrec_desloc) listPntsStrFml.push("95");

        let listPntsStrCids: string[] = [];
        m.pernoites.forEach(p => {
            const custo = p.custo;
            const vals = custo.vals;

            const diarias = vals.reduce((acc, val) => (val.qtd + acc), 0)
            listPntsStrCids.push(`${p.cidade.nome}-${p.cidade.uf} (${diarias.toFixed(1)})`)

            let pntVals = vals.map(val => (
                `(${val.qtd}*${val.valor})`
            )).join("+");

            if (p.acrec_desloc) pntVals += `+${custo.ac_desloc}`
            listPntsStrFml.push(`(${pntVals})`);
        })
        misStr += listPntsStrCids.join(', ')

        sheet.getCell(r1c1ToA1(row, 11)).value = misStr.toUpperCase();

        // valor da diaria
        const valDiaria = sheet.getCell(r1c1ToA1(row, 16));
        valDiaria.value = listPntsStrFml.length ? { formula: listPntsStrFml.join("+") } : 0;
        valDiaria.numFmt = 'R$ #,##0.00';
    }
    )

    const total_dias = sheet.getCell("H4");
    total_dias.numFmt = "#";
    total_dias.value = {
        formula: `SUM(${r1c1ToA1(startRowData, 7)}:${r1c1ToA1(totalRows, 7)})`
    }
    sheet.mergeCells(startRowData, 8, totalRows, 8)

    const total_diarias = sheet.getCell("J4");
    total_diarias.value = {
        formula: `SUM(${r1c1ToA1(startRowData, 9)}:${r1c1ToA1(totalRows, 9)})`
    }
    total_diarias.numFmt = "#";
    sheet.mergeCells(startRowData, 10, totalRows, 10)

    const qtd_aj_custo = sheet.getCell("L4");
    qtd_aj_custo.value = comiss.qtd_aj_ab + comiss.qtd_aj_fc;
    sheet.mergeCells(startRowData, 12, totalRows, 12)

    const valAjdAb = sheet.getCell("M4");
    valAjdAb.value = comiss.valor_aj_ab;
    valAjdAb.numFmt = 'R$ #,##0.00';
    sheet.mergeCells(startRowData, 13, totalRows, 13)

    const valAjdFc = sheet.getCell("N4");
    valAjdFc.value = comiss.valor_aj_fc;
    valAjdFc.numFmt = 'R$ #,##0.00';
    sheet.mergeCells(startRowData, 14, totalRows, 14)

    const valAjdTotal = sheet.getCell("O4");
    valAjdTotal.value = {
        formula: `${r1c1ToA1(startRowData, 13)}+${r1c1ToA1(startRowData, 14)}`
    };
    valAjdTotal.numFmt = 'R$ #,##0.00';
    sheet.mergeCells(startRowData, 15, totalRows, 15)

    const valTotalDiarias = sheet.getCell("Q4")
    valTotalDiarias.value = {
        formula: `SUM(${r1c1ToA1(startRowData, 16)}:${r1c1ToA1(totalRows, 16)})`
    }
    valTotalDiarias.numFmt = 'R$ #,##0.00';
    sheet.mergeCells(startRowData, 17, totalRows, 17)

    autoSizeColumn(11, sheet);
    sheet.eachRow(row => {
        row.eachCell(cell => {
            // Alinhamento
            cell.alignment = {
                ...cell.alignment,
                vertical: 'middle',
                horizontal: 'center'
            };

            // Bordas
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            };
        });
    });

    // Gerar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return blob;
}