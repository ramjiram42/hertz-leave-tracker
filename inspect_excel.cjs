const XLSX = require('xlsx');
const path = require('path');

const filePath = 'C:/Users/RamP/Downloads/Hertz 2026 tracker.xlsx';

try {
  const workbook = XLSX.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);
  
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    console.log(`\n--- ${sheetName} ---`);
    console.log('First 5 rows:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
  });
} catch (e) {
  console.error('Error reading file:', e.message);
}
