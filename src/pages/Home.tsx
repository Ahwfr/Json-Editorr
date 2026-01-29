import React, { useState, useCallback, useEffect } from "react";
import { 
  Upload, 
  Download, 
  RotateCcw, 
  Code, 
  Layout, 
  FileJson,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { JsonNode } from "@/components/JsonNode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

// Initial Example Data
const DEFAULT_JSON = {
  project: "Simple JSON Editor",
  version: 1.0,
  features: [
    { name: "Visual Editing", enabled: true },
    { name: "Raw Editing", enabled: true },
    { name: "Export", enabled: true }
  ],
  settings: {
    theme: "light",
    autoSave: false
  }
};

export default function Home() {
  const [data, setData] = useState<any>(DEFAULT_JSON);
  const [rawText, setRawText] = useState(JSON.stringify(DEFAULT_JSON, null, 2));
  const [isValidJson, setIsValidJson] = useState(true);
  const { toast } = useToast();

  // Sync raw text when visual data changes
  const updateData = (newData: any) => {
    setData(newData);
    setRawText(JSON.stringify(newData, null, 2));
  };

  // Sync visual data when raw text changes
  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    try {
      const parsed = JSON.parse(text);
      setData(parsed);
      setIsValidJson(true);
    } catch (err) {
      setIsValidJson(false);
    }
  };

  // Helper to deep clone and update nested value
  const setNestedValue = (obj: any, path: (string | number)[], value: any): any => {
    if (path.length === 0) return value;
    const [head, ...tail] = path;
    
    if (Array.isArray(obj)) {
      const newArr = [...obj];
      // @ts-ignore - we know head is a number for arrays
      newArr[head] = setNestedValue(obj[head], tail, value);
      return newArr;
    }
    
    return {
      ...obj,
      [head]: setNestedValue(obj[head], tail, value)
    };
  };

  // Helper to deep clone and delete nested value
  const deleteNestedValue = (obj: any, path: (string | number)[]): any => {
    if (path.length === 1) {
      const head = path[0];
      if (Array.isArray(obj)) {
        return obj.filter((_, i) => i !== head);
      }
      const { [head]: deleted, ...rest } = obj;
      return rest;
    }
    
    const [head, ...tail] = path;
    if (Array.isArray(obj)) {
      const newArr = [...obj];
      // @ts-ignore
      newArr[head] = deleteNestedValue(obj[head], tail);
      return newArr;
    }
    
    return {
      ...obj,
      [head]: deleteNestedValue(obj[head], tail)
    };
  };

  // Helper to rename a key in an object
  const renameKey = (obj: any, path: (string | number)[], newKey: string): any => {
    // If we are at the parent of the key to rename
    if (path.length === 1) {
      const oldKey = path[0];
      if (oldKey === newKey) return obj;
      if (Array.isArray(obj)) return obj; // Cannot rename array indices directly

      const newObj: any = {};
      Object.keys(obj).forEach(key => {
        if (key === oldKey) {
          newObj[newKey] = obj[key];
        } else {
          newObj[key] = obj[key];
        }
      });
      return newObj;
    }

    const [head, ...tail] = path;
    if (Array.isArray(obj)) {
      const newArr = [...obj];
      // @ts-ignore
      newArr[head] = renameKey(obj[head], tail, newKey);
      return newArr;
    }

    return {
      ...obj,
      [head]: renameKey(obj[head], tail, newKey)
    };
  };

  const handleUpdate = useCallback((path: (string | number)[], value: any) => {
    updateData(setNestedValue(data, path, value));
  }, [data]);

  const handleDelete = useCallback((path: (string | number)[]) => {
    updateData(deleteNestedValue(data, path));
  }, [data]);

  const handleRename = useCallback((path: (string | number)[], newName: string) => {
    updateData(renameKey(data, path, newName));
  }, [data]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        updateData(parsed);
        toast({
          title: "File Uploaded",
          description: "JSON file successfully loaded.",
          variant: "default",
        });
      } catch (err) {
        toast({
          title: "Invalid JSON",
          description: "The file you uploaded contains invalid JSON.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "JSON file saved to your device.",
    });
  };

  const handleReset = () => {
    updateData(DEFAULT_JSON);
    toast({
      title: "Reset",
      description: "Editor reset to default state.",
    });
  };

  return (
    <div className="min-h-screen bg-background/50 font-sans p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-primary/20 shrink-0">
            <FileJson className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
              JSON Visualizer
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium truncate">
              Parse, edit, and validate JSON structures visually
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="rounded-lg sm:rounded-xl border-border bg-card/50 hover:bg-card shadow-sm hover:shadow-md transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4"
            data-testid="button-upload"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Upload</span>
            <input 
              id="file-upload" 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileUpload} 
              data-testid="input-file-upload"
            />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="rounded-lg sm:rounded-xl border-border bg-card/50 hover:bg-card shadow-sm hover:shadow-md transition-all duration-200 text-muted-foreground hover:text-destructive text-xs sm:text-sm px-2 sm:px-4"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button 
            onClick={handleDownload}
            className="rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 text-xs sm:text-sm px-2 sm:px-4"
            data-testid="button-download"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Export JSON</span>
          </Button>
        </div>
      </motion.div>

      {/* Main Editor */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto"
      >
        <Card className="border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-xl overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl">
          <CardHeader className="border-b border-border/40 pb-0 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <Tabs defaultValue="visual" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <TabsList className="bg-muted/50 p-1 rounded-lg sm:rounded-xl w-full sm:w-auto">
                    <TabsTrigger 
                      value="visual" 
                      className="flex-1 sm:flex-none rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs sm:text-sm"
                      data-testid="tab-visual"
                    >
                      <Layout className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden xs:inline">Visual</span>
                      <span className="xs:hidden">Visual</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="raw" 
                      className="flex-1 sm:flex-none rounded-md sm:rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all text-xs sm:text-sm"
                      data-testid="tab-raw"
                    >
                      <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden xs:inline">Raw JSON</span>
                      <span className="xs:hidden">Raw</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  {isValidJson ? (
                    <div className="flex items-center justify-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-100 shrink-0" data-testid="status-valid-json">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                      Valid JSON
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-xs font-medium text-destructive bg-destructive/5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-destructive/10 shrink-0" data-testid="status-invalid-json">
                      <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" />
                      Invalid Syntax
                    </div>
                  )}
                </div>

                <div className="p-0">
                  <TabsContent value="visual" className="mt-0 outline-none">
                    <div className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] max-h-[60vh] sm:max-h-[70vh] md:max-h-[80vh] overflow-auto p-3 sm:p-4 md:p-6 bg-gradient-to-br from-background/50 to-muted/20">
                      <JsonNode 
                        data={data} 
                        name="root" 
                        path={[]} 
                        isRoot 
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onRename={handleRename}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="raw" className="mt-0 outline-none">
                    <div className="relative">
                      <Textarea 
                        value={rawText} 
                        onChange={handleRawChange}
                        className="min-h-[400px] sm:min-h-[500px] md:min-h-[600px] font-mono text-xs sm:text-sm bg-slate-950 text-slate-50 border-0 rounded-none resize-none focus-visible:ring-0 p-3 sm:p-4 md:p-6 leading-relaxed"
                        spellCheck={false}
                        data-testid="textarea-raw-json"
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}
