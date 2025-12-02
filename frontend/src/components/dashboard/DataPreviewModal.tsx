import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  CheckCircle2,
  Hash,
  Calendar,
  Type,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ColumnInfo {
  name: string;
  type: "numeric" | "date" | "categorical" | "unknown";
  missingCount: number;
  missingPercent: number;
  uniqueCount: number;
  sampleValues: string[];
}

interface DataQualityWarning {
  type: "missing" | "empty_column" | "unsupported" | "low_quality";
  message: string;
  severity: "warning" | "error" | "info";
  column?: string;
}

interface PreviewData {
  columns: ColumnInfo[];
  rows: Record<string, any>[];
  totalRows: number;
  warnings: DataQualityWarning[];
}

interface DataPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File | null;
}

const detectColumnType = (values: any[]): "numeric" | "date" | "categorical" | "unknown" => {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
  if (nonNullValues.length === 0) return "unknown";

  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/,
    /^\d{2}\/\d{2}\/\d{4}$/,
    /^\d{2}-\d{2}-\d{4}$/,
    /^\d{4}\/\d{2}\/\d{2}$/,
  ];

  let numericCount = 0;
  let dateCount = 0;

  for (const val of nonNullValues.slice(0, 50)) {
    const strVal = String(val).trim();
    if (!isNaN(Number(strVal)) && strVal !== "") {
      numericCount++;
    }
    if (datePatterns.some(p => p.test(strVal)) || !isNaN(Date.parse(strVal))) {
      dateCount++;
    }
  }

  const threshold = nonNullValues.slice(0, 50).length * 0.7;
  if (numericCount >= threshold) return "numeric";
  if (dateCount >= threshold) return "date";
  return "categorical";
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "numeric": return <Hash className="h-3 w-3" />;
    case "date": return <Calendar className="h-3 w-3" />;
    case "categorical": return <Type className="h-3 w-3" />;
    default: return <AlertCircle className="h-3 w-3" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "numeric": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "date": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "categorical": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

export function DataPreviewModal({ isOpen, onClose, onConfirm, file }: DataPreviewModalProps) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file) {
      parseFile(file);
    } else {
      setPreviewData(null);
      setError(null);
    }
  }, [isOpen, file]);

  const parseFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          preview: 100,
          complete: (results) => {
            processData(results.data as any[], results.meta.fields || []);
          },
          error: (err) => {
            setError(`CSV parsing failed: ${err.message}`);
            setIsLoading(false);
          },
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: "array", cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: "yyyy-mm-dd" });
            const fields = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];
            processData(jsonData as any[], fields);
          } catch (err: any) {
            setError(`Excel parsing failed: ${err.message}`);
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Could not read the Excel file");
          setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else if (fileName.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonText = e.target?.result as string;
            const jsonData = JSON.parse(jsonText);
            const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            const fields = dataArray.length > 0 ? Object.keys(dataArray[0] as object) : [];
            processData(dataArray, fields);
          } catch (err: any) {
            setError(`JSON parsing failed: ${err.message}`);
            setIsLoading(false);
          }
        };
        reader.onerror = () => {
          setError("Could not read the JSON file");
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else {
        setError("Unsupported file format. Please use CSV, Excel, or JSON files for preview.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to parse file");
      setIsLoading(false);
    }
  };

  const processData = (data: any[], fields: string[]) => {
    const warnings: DataQualityWarning[] = [];
    const columns: ColumnInfo[] = [];

    for (const field of fields) {
      const values = data.map(row => row[field]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== "");
      const missingCount = values.length - nonNullValues.length;
      const missingPercent = (missingCount / values.length) * 100;
      const uniqueValues = new Set(nonNullValues.map(v => String(v)));

      const columnInfo: ColumnInfo = {
        name: field,
        type: detectColumnType(values),
        missingCount,
        missingPercent,
        uniqueCount: uniqueValues.size,
        sampleValues: Array.from(uniqueValues).slice(0, 3).map(v => String(v)),
      };
      columns.push(columnInfo);

      // Generate warnings
      if (missingPercent === 100) {
        warnings.push({
          type: "empty_column",
          message: `Column "${field}" is completely empty`,
          severity: "error",
          column: field,
        });
      } else if (missingPercent > 50) {
        warnings.push({
          type: "missing",
          message: `Column "${field}" has ${missingPercent.toFixed(0)}% missing values`,
          severity: "warning",
          column: field,
        });
      } else if (missingPercent > 20) {
        warnings.push({
          type: "missing",
          message: `Column "${field}" has ${missingPercent.toFixed(0)}% missing values`,
          severity: "info",
          column: field,
        });
      }

      if (columnInfo.type === "unknown") {
        warnings.push({
          type: "unsupported",
          message: `Column "${field}" has inconsistent or unrecognized data types`,
          severity: "warning",
          column: field,
        });
      }
    }

    if (data.length < 5) {
      warnings.push({
        type: "low_quality",
        message: `Dataset has only ${data.length} rows. Consider adding more data for better analysis.`,
        severity: "info",
      });
    }

    setPreviewData({
      columns,
      rows: data.slice(0, 5),
      totalRows: data.length,
      warnings,
    });
    setIsLoading(false);
  };

  const hasErrors = previewData?.warnings.some(w => w.severity === "error");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Data Preview
          </DialogTitle>
          <DialogDescription>
            Review your data before uploading. Check column types and data quality warnings.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Parsing file...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {previewData && !isLoading && (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Summary */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                <strong className="text-foreground">{previewData.totalRows}</strong> rows
              </span>
              <span className="text-muted-foreground">
                <strong className="text-foreground">{previewData.columns.length}</strong> columns
              </span>
              <span className="text-muted-foreground">
                Showing first <strong className="text-foreground">5</strong> rows
              </span>
            </div>

            {/* Column Types */}
            <div className="flex flex-wrap gap-2">
              {previewData.columns.map((col) => (
                <div
                  key={col.name}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs ${getTypeBadgeColor(col.type)}`}
                >
                  {getTypeIcon(col.type)}
                  <span className="font-medium">{col.name}</span>
                  <span className="opacity-70">({col.type})</span>
                </div>
              ))}
            </div>

            {/* Data Table */}
            <ScrollArea className="flex-1 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewData.columns.map((col) => (
                      <TableHead key={col.name} className="whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(col.type)}
                          {col.name}
                          {col.missingPercent > 0 && (
                            <span className="text-[10px] text-amber-500 ml-1">
                              ({col.missingPercent.toFixed(0)}% empty)
                            </span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, idx) => (
                    <TableRow key={idx}>
                      {previewData.columns.map((col) => (
                        <TableCell key={col.name} className="max-w-[200px] truncate">
                          {row[col.name] !== null && row[col.name] !== undefined
                            ? String(row[col.name])
                            : <span className="text-muted-foreground italic">empty</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {/* Warnings */}
            {previewData.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Data Quality Warnings ({previewData.warnings.length})
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {previewData.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 text-xs p-2 rounded ${
                        warning.severity === "error"
                          ? "bg-destructive/10 text-destructive"
                          : warning.severity === "warning"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      {warning.severity === "error" ? (
                        <AlertCircle className="h-3 w-3" />
                      ) : warning.severity === "warning" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3" />
                      )}
                      {warning.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={onConfirm}
            disabled={isLoading || !!error || hasErrors}
          >
            {hasErrors ? "Fix Errors First" : "Confirm & Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
