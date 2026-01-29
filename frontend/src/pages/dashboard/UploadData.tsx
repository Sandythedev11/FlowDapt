import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  FileSpreadsheet, 
  FileJson, 
  FileText,
  X,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { runFullAnalysis, storeAnalysisResults, type AnalysisData, type AnalyticsResult } from "@/lib/analyticsEngine";
import { DataPreviewModal } from "@/components/dashboard/DataPreviewModal";
import { SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { setUserItem, STORAGE_KEYS } from "@/lib/userStorage";
import { API_ENDPOINTS } from "@/config/api";

// Index data for AI analysis (limit to 500 rows to prevent payload issues)
const indexDataForAI = async (data: AnalysisData, analyticsRes: AnalyticsResult) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const totalRows = data.data?.length || 0;
    const maxRows = 500;
    const dataToSend = data.data?.slice(0, maxRows) || [];

    console.log(`📤 Indexing for AI: ${dataToSend.length}/${totalRows} rows`);

    const response = await fetch(API_ENDPOINTS.AI.INDEX, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        analysisData: {
          ...data,
          data: dataToSend,
          rowCount: totalRows
        },
        analyticsResults: analyticsRes,
        insights: analyticsRes.insights || []
      }),
    });
    
    const result = await response.json();
    if (result.success) {
      console.log("✅ Data indexed for AI after upload:", result);
    } else {
      console.error("❌ AI indexing failed:", result.message);
    }
  } catch (error) {
    console.error("Failed to index data for AI:", error);
  }
};

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  file?: File; // Store actual file for analysis
}

const getFileIcon = (type: string) => {
  if (type.includes("csv") || type.includes("excel") || type.includes("spreadsheet")) {
    return FileSpreadsheet;
  }
  if (type.includes("json")) {
    return FileJson;
  }
  if (type.includes("pdf")) {
    return FileText;
  }
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const UploadData = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    const completedFiles = files.filter((f) => f.status === "completed");
    
    if (completedFiles.length === 0) {
      toast({
        title: "No files to analyze",
        description: "Please upload files before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analyze the first completed file
      const fileToAnalyze = completedFiles[0];
      
      if (!fileToAnalyze.file) {
        throw new Error("File data not available");
      }

      const fileName = fileToAnalyze.name.toLowerCase();

      // CSV File Processing
      if (fileName.endsWith('.csv')) {
        Papa.parse(fileToAnalyze.file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const analysisData: AnalysisData = {
              fileName: fileToAnalyze.name,
              fileType: 'csv',
              data: results.data as any[],
              fields: results.meta.fields || [],
              rowCount: results.data.length,
              timestamp: new Date().toISOString(),
            };

            // Run full analytics engine
            const analyticsResults = runFullAnalysis(analysisData);
            storeAnalysisResults(analysisData, analyticsResults);

            // Index for AI immediately
            indexDataForAI(analysisData, analyticsResults);

            toast({
              title: "🎉 Analysis Complete!",
              description: `Generated ${analyticsResults.insights.length} insights, detected ${analyticsResults.numericColumns.length} numeric columns, found ${analyticsResults.correlations.length} correlations.`,
            });

            setTimeout(() => {
              navigate('/dashboard/analytics');
            }, 1000);
          },
          error: (error) => {
            throw new Error(`CSV parsing failed: ${error.message}`);
          }
        });
      }
      
      // Excel File Processing (.xlsx, .xls)
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

            if (jsonData.length === 0) {
              throw new Error("Excel file is empty or has no data");
            }

            const fields = Object.keys(jsonData[0] as object);

            const analysisData: AnalysisData = {
              fileName: fileToAnalyze.name,
              fileType: 'excel',
              data: jsonData as any[],
              fields: fields,
              rowCount: jsonData.length,
              timestamp: new Date().toISOString(),
            };

            // Run full analytics engine
            const analyticsResults = runFullAnalysis(analysisData);
            storeAnalysisResults(analysisData, analyticsResults);

            // Index for AI immediately
            indexDataForAI(analysisData, analyticsResults);

            toast({
              title: "🎉 Analysis Complete!",
              description: `Generated ${analyticsResults.insights.length} insights, detected ${analyticsResults.numericColumns.length} numeric columns, found ${analyticsResults.correlations.length} correlations.`,
            });

            setTimeout(() => {
              navigate('/dashboard/analytics');
            }, 1000);
            setIsAnalyzing(false);
          } catch (error: any) {
            toast({
              title: "Excel parsing failed",
              description: error.message || "Could not parse Excel file",
              variant: "destructive",
            });
            setIsAnalyzing(false);
          }
        };
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: "Could not read the Excel file",
            variant: "destructive",
          });
          setIsAnalyzing(false);
        };
        reader.readAsArrayBuffer(fileToAnalyze.file);
      }
      
      // JSON File Processing
      else if (fileName.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonText = e.target?.result as string;
            const jsonData = JSON.parse(jsonText);
            
            // Handle both array and single object
            const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
            
            if (dataArray.length === 0) {
              throw new Error("JSON file is empty");
            }

            const fields = Object.keys(dataArray[0] as object);

            const analysisData: AnalysisData = {
              fileName: fileToAnalyze.name,
              fileType: 'json',
              data: dataArray,
              fields: fields,
              rowCount: dataArray.length,
              timestamp: new Date().toISOString(),
            };

            // Run full analytics engine
            const analyticsResults = runFullAnalysis(analysisData);
            storeAnalysisResults(analysisData, analyticsResults);

            // Index for AI immediately
            indexDataForAI(analysisData, analyticsResults);

            toast({
              title: "🎉 Analysis Complete!",
              description: `Generated ${analyticsResults.insights.length} insights, detected ${analyticsResults.numericColumns.length} numeric columns, found ${analyticsResults.correlations.length} correlations.`,
            });

            setTimeout(() => {
              navigate('/dashboard/analytics');
            }, 1000);
            setIsAnalyzing(false);
          } catch (error: any) {
            toast({
              title: "JSON parsing failed",
              description: error.message || "Invalid JSON format",
              variant: "destructive",
            });
            setIsAnalyzing(false);
          }
        };
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: "Could not read the JSON file",
            variant: "destructive",
          });
          setIsAnalyzing(false);
        };
        reader.readAsText(fileToAnalyze.file);
      }
      
      // PDF File Processing
      else if (fileName.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            
            // For PDF, we'll extract text and create a simple analysis
            // Note: Full PDF parsing requires pdf-parse or similar library
            // For now, we'll create a placeholder structure
            
            const textContent = "PDF text extraction requires additional setup. " +
                              "This is a placeholder for PDF content analysis.";
            
            const words = textContent.split(/\s+/).filter(w => w.length > 0);
            const wordCount = words.length;
            const charCount = textContent.length;
            
            // Create word frequency data
            const wordFreq: { [key: string]: number } = {};
            words.forEach(word => {
              const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (cleanWord) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
              }
            });

            const topWords = Object.entries(wordFreq)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([word, count]) => ({ word, count }));

            setUserItem(STORAGE_KEYS.ANALYSIS_DATA, {
              fileName: fileToAnalyze.name,
              fileType: 'pdf',
              textContent: textContent,
              wordCount: wordCount,
              charCount: charCount,
              topWords: topWords,
              data: topWords, // For chart compatibility
              fields: ['word', 'count'],
              timestamp: new Date().toISOString(),
            });

            toast({
              title: "PDF Analysis complete!",
              description: `Analyzed ${fileToAnalyze.name}. Note: Full PDF parsing requires additional setup.`,
            });

            setTimeout(() => {
              navigate('/dashboard/analytics');
            }, 1000);
            setIsAnalyzing(false);
          } catch (error: any) {
            toast({
              title: "PDF processing failed",
              description: error.message || "Could not process PDF file",
              variant: "destructive",
            });
            setIsAnalyzing(false);
          }
        };
        reader.onerror = () => {
          toast({
            title: "File read error",
            description: "Could not read the PDF file",
            variant: "destructive",
          });
          setIsAnalyzing(false);
        };
        reader.readAsArrayBuffer(fileToAnalyze.file);
      }
      
      // Unsupported file type
      else {
        toast({
          title: "Unsupported file type",
          description: "Please upload CSV, Excel (.xlsx, .xls), JSON, or PDF files.",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      }

    } catch (error: any) {
      toast({
        title: "Analysis failed",
        description: error.message || "An error occurred while analyzing your files. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = useCallback((uploadedFiles: FileList | null) => {
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

    // Only accept single file
    if (uploadedFiles.length > 1) {
      toast({
        title: "Single file only",
        description: "Please upload one file at a time. Select a single file to continue.",
        variant: "destructive",
      });
      return;
    }

    // Clear existing files when uploading new one
    setFiles([]);

    const file = uploadedFiles[0];

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File size limit exceeded",
        description: `${file.name} exceeds the 5 MB limit. Please upload a smaller file.`,
        variant: "destructive",
      });
      return;
    }

    const fileName = file.name.toLowerCase();
    // Show preview for Excel and JSON files
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.json') || fileName.endsWith('.csv')) {
      setPendingFile(file);
      setShowPreview(true);
      return;
    }

    // For other files (PDF), proceed directly
    processFileUpload(file);
  }, [toast]);

  const processFileUpload = useCallback((file: File) => {
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "uploading" as const,
      file: file,
    };

    setFiles([newFile]);

    // Simulate upload progress
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === newFile.id) {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100);
            return {
              ...f,
              progress: newProgress,
              status: newProgress === 100 ? "completed" : "uploading",
            };
          }
          return f;
        })
      );
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress: 100, status: "completed" } : f
        )
      );
      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });
    }, 2000);
  }, [toast]);

  const handlePreviewConfirm = useCallback(() => {
    if (pendingFile) {
      processFileUpload(pendingFile);
      setShowPreview(false);
      setPendingFile(null);
    }
  }, [pendingFile, processFileUpload]);

  const handlePreviewClose = useCallback(() => {
    setShowPreview(false);
    setPendingFile(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set dragOver to false if leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Upload Data</h1>
              <span className="text-[10px] text-muted-foreground/50 font-mono bg-secondary/40 px-1.5 py-0.5 rounded">
                {SHORTCUTS.UPLOAD.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              Upload your data files for AI-powered analysis
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                isDragOver
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls,.json,.pdf"
                onChange={(e) => {
                  handleFileUpload(e.target.files);
                  e.target.value = ''; // Reset input to allow re-uploading same file
                }}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer block"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
              >
                <div className="w-16 h-16 mx-auto rounded-full gradient-primary flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Drag and drop your file here
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse from your computer
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {["CSV", "Excel", "JSON", "PDF"].map((format) => (
                    <span
                      key={format}
                      className="px-3 py-1 rounded-full bg-secondary text-sm font-medium"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 5 MB
                  </p>
                  <p className="text-xs text-amber-500 font-medium">
                    ⚠️ One file at a time
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    💡 Upload Excel (.xlsx) or JSON files — these formats deliver the highest-quality results
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Uploaded File</CardTitle>
              <CardDescription>
                {files[0]?.status === "completed" ? "Ready for analysis" : "Uploading..."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{file.name}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        {file.status === "uploading" && (
                          <Progress value={file.progress} className="h-1.5" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "uploading" && (
                          <Loader2 className="h-5 w-5 text-primary animate-spin" />
                        )}
                        {file.status === "completed" && (
                          <CheckCircle2 className="h-5 w-5 text-accent" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                  disabled={files.length === 0}
                >
                  Clear All
                </Button>
                <Button 
                  variant="gradient"
                  disabled={!files.some((f) => f.status === "completed") || isAnalyzing}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    `Analyze Files (${files.filter((f) => f.status === "completed").length})`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Supported Formats Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { format: "CSV", desc: "Comma-separated values", icon: FileSpreadsheet },
            { format: "Excel", desc: ".xlsx, .xls files", icon: FileSpreadsheet },
            { format: "JSON", desc: "JavaScript Object Notation", icon: FileJson },
            { format: "PDF", desc: "Portable Document Format", icon: FileText },
          ].map((item) => (
            <Card key={item.format} className="card-shadow">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{item.format}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Preview Modal */}
      <DataPreviewModal
        isOpen={showPreview}
        onClose={handlePreviewClose}
        onConfirm={handlePreviewConfirm}
        file={pendingFile}
      />
    </DashboardLayout>
  );
};

export default UploadData;
