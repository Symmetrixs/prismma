interface ExportOptions {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  textColumns?: number[];
  columnWidths?: number[];
}

export async function downloadXlsx({ filename, headers, rows, textColumns = [], columnWidths }: ExportOptions) {
  const XLSX = await import("xlsx-js-style");
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  textColumns.forEach((colIndex) => {
    for (let rowIndex = 1; rowIndex <= rows.length; rowIndex++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      const cell = worksheet[cellRef];
      if (cell) {
        cell.t = "s";
        cell.z = "@";
        cell.v = String(cell.v);
      }
    }
  });

  worksheet["!cols"] = (columnWidths || headers.map(() => 16)).map((w) => ({ wch: w }));

  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c });
    const cell = worksheet[cellRef];
    if (cell) {
      cell.s = { font: { bold: true }, fill: { fgColor: { rgb: "F3F4F6" } } };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, filename);
}
