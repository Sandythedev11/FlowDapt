const csv = require('csv-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const pdf = require('pdf-parse');

// Parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error('Failed to parse Excel file');
  }
};

// Parse PDF file
const parsePDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return { text: data.text, pages: data.numpages };
  } catch (error) {
    throw new Error('Failed to parse PDF file');
  }
};

// Generate summary statistics
const generateSummary = (data) => {
  if (!data || data.length === 0) {
    return null;
  }

  const columnNames = Object.keys(data[0]);
  const totalRows = data.length;
  const totalColumns = columnNames.length;

  // Determine data types
  const dataTypes = {};
  columnNames.forEach((col) => {
    const sampleValue = data[0][col];
    dataTypes[col] = isNaN(sampleValue) ? 'string' : 'number';
  });

  return {
    totalRows,
    totalColumns,
    columnNames,
    dataTypes,
  };
};

// Generate statistics
const generateStatistics = (data) => {
  if (!data || data.length === 0) {
    return null;
  }

  const columnNames = Object.keys(data[0]);
  const numericColumns = {};
  const categoricalColumns = {};

  columnNames.forEach((col) => {
    const values = data.map((row) => row[col]).filter((v) => v !== null && v !== undefined);
    
    // Check if numeric
    const numericValues = values.filter((v) => !isNaN(v)).map(Number);
    
    if (numericValues.length > values.length * 0.5) {
      // Numeric column
      const sorted = numericValues.sort((a, b) => a - b);
      const sum = sorted.reduce((acc, val) => acc + val, 0);
      const mean = sum / sorted.length;
      
      numericColumns[col] = {
        count: sorted.length,
        mean: mean.toFixed(2),
        min: sorted[0],
        max: sorted[sorted.length - 1],
        median: sorted[Math.floor(sorted.length / 2)],
      };
    } else {
      // Categorical column
      const frequency = {};
      values.forEach((v) => {
        frequency[v] = (frequency[v] || 0) + 1;
      });
      
      categoricalColumns[col] = {
        uniqueValues: Object.keys(frequency).length,
        topValues: Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([value, count]) => ({ value, count })),
      };
    }
  });

  return { numericColumns, categoricalColumns };
};

// Generate insights
const generateInsights = (data) => {
  if (!data || data.length === 0) {
    return null;
  }

  const columnNames = Object.keys(data[0]);
  const missingValues = {};
  
  // Count missing values
  columnNames.forEach((col) => {
    const missing = data.filter((row) => 
      row[col] === null || row[col] === undefined || row[col] === ''
    ).length;
    if (missing > 0) {
      missingValues[col] = missing;
    }
  });

  // Detect duplicate rows
  const uniqueRows = new Set(data.map((row) => JSON.stringify(row)));
  const duplicateRows = data.length - uniqueRows.size;

  return {
    missingValues,
    duplicateRows,
    outliers: {}, // Placeholder for outlier detection
    correlations: {}, // Placeholder for correlation analysis
  };
};

module.exports = {
  parseCSV,
  parseExcel,
  parsePDF,
  generateSummary,
  generateStatistics,
  generateInsights,
};
