import React, { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Type, 
  Hash, 
  ToggleLeft, 
  List, 
  Braces 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

interface JsonNodeProps {
  data: JsonValue;
  name: string; // The key or index
  path: (string | number)[];
  isRoot?: boolean;
  onUpdate: (path: (string | number)[], value: JsonValue) => void;
  onDelete: (path: (string | number)[]) => void;
  onRename?: (path: (string | number)[], newName: string) => void;
}

const getType = (value: JsonValue): "string" | "number" | "boolean" | "object" | "array" | "null" => {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
};

export const JsonNode: React.FC<JsonNodeProps> = ({ 
  data, 
  name, 
  path, 
  isRoot = false, 
  onUpdate, 
  onDelete,
  onRename 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const type = getType(data);
  const isContainer = type === "object" || type === "array";

  const handleValueChange = (newValue: string | number | boolean) => {
    onUpdate(path, newValue);
  };

  const handleAddChild = (childType: "string" | "number" | "boolean" | "object" | "array") => {
    let defaultValue: JsonValue = "";
    if (childType === "number") defaultValue = 0;
    if (childType === "boolean") defaultValue = false;
    if (childType === "object") defaultValue = {};
    if (childType === "array") defaultValue = [];

    if (type === "array") {
      const newArray = [...(data as JsonArray)];
      newArray.push(defaultValue);
      onUpdate(path, newArray);
    } else if (type === "object") {
      const newKey = `newKey${Object.keys(data as JsonObject).length + 1}`;
      const newObj = { ...(data as JsonObject), [newKey]: defaultValue };
      onUpdate(path, newObj);
    }
    setIsExpanded(true);
  };

  const TypeIcon = () => {
    switch (type) {
      case "string": return <Type className="w-3.5 h-3.5 text-orange-500" />;
      case "number": return <Hash className="w-3.5 h-3.5 text-blue-500" />;
      case "boolean": return <ToggleLeft className="w-3.5 h-3.5 text-purple-500" />;
      case "array": return <List className="w-3.5 h-3.5 text-green-500" />;
      case "object": return <Braces className="w-3.5 h-3.5 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "relative pl-2 sm:pl-4 border-l border-border/40 transition-all duration-200",
        isRoot ? "pl-0 border-l-0" : "my-0.5 sm:my-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1 sm:gap-2 group py-0.5 sm:py-1 flex-wrap sm:flex-nowrap">
        {/* Expand/Collapse Button for Containers */}
        {isContainer ? (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 rounded-md hover:bg-muted text-muted-foreground transition-colors shrink-0"
            data-testid={`button-toggle-${path.join('-') || 'root'}`}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        ) : (
          <div className="w-4 sm:w-5 shrink-0" />
        )}

        {/* Key Name */}
        <div className="flex items-center gap-1 sm:gap-2 font-mono text-xs sm:text-sm shrink-0 max-w-[120px] sm:max-w-none">
          {!isRoot && (
            <div className="flex items-center bg-muted/30 rounded px-1 sm:px-1.5 py-0.5 border border-transparent hover:border-border transition-colors overflow-hidden">
              <span className="text-muted-foreground/70 mr-1 sm:mr-1.5 opacity-50 select-none shrink-0">
                <TypeIcon />
              </span>
              <input
                className="bg-transparent border-none focus:ring-0 focus:outline-none p-0 text-foreground w-auto min-w-[20px] sm:min-w-[30px] font-semibold text-[10px] sm:text-xs"
                value={name}
                readOnly={typeof path[path.length - 1] === 'number'}
                onChange={(e) => onRename && onRename(path, e.target.value)}
                style={{ width: `${Math.min(Math.max(name.length, 3), 15)}ch` }}
                data-testid={`input-key-${path.join('-')}`}
              />
              <span className="text-muted-foreground">:</span>
            </div>
          )}
        </div>

        {/* Value Input */}
        <div className="flex-1 min-w-0 max-w-full">
          {type === "string" && (
            <Input 
              value={data as string} 
              onChange={(e) => handleValueChange(e.target.value)}
              className="h-6 sm:h-7 text-[10px] sm:text-xs font-mono bg-background/50 border-transparent hover:border-border focus:border-primary transition-all w-full max-w-[150px] sm:max-w-[250px] md:max-w-[300px]" 
              data-testid={`input-value-${path.join('-')}`}
            />
          )}
          {type === "number" && (
            <Input 
              type="number"
              value={data as number} 
              onChange={(e) => handleValueChange(Number(e.target.value))}
              className="h-6 sm:h-7 text-[10px] sm:text-xs font-mono text-blue-600 bg-background/50 border-transparent hover:border-border focus:border-primary transition-all w-20 sm:w-32" 
              data-testid={`input-value-${path.join('-')}`}
            />
          )}
          {type === "boolean" && (
            <Switch 
              checked={data as boolean}
              onCheckedChange={handleValueChange}
              className="scale-[0.6] sm:scale-75 origin-left"
              data-testid={`switch-value-${path.join('-')}`}
            />
          )}
          {type === "null" && (
            <span className="text-[10px] sm:text-xs text-muted-foreground italic">null</span>
          )}
          {isContainer && (
            <span className="text-[10px] sm:text-xs text-muted-foreground/60 italic font-mono truncate">
              {type === "array" ? `[${(data as JsonArray).length}]` : `{${Object.keys(data as JsonObject).length}}`}
            </span>
          )}
        </div>

        {/* Actions - Always visible on mobile for touch devices */}
        <div className={cn(
          "flex items-center gap-0.5 sm:gap-1 shrink-0",
          "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200",
          (isHovered || isExpanded) && "sm:opacity-100"
        )}>
          {isContainer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full hover:bg-primary/10 hover:text-primary"
                  data-testid={`button-add-${path.join('-') || 'root'}`}
                >
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                <DropdownMenuItem onClick={() => handleAddChild("string")} data-testid="menu-add-string">Add String</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddChild("number")} data-testid="menu-add-number">Add Number</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddChild("boolean")} data-testid="menu-add-boolean">Add Boolean</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddChild("object")} data-testid="menu-add-object">Add Object</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddChild("array")} data-testid="menu-add-array">Add Array</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {!isRoot && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 sm:h-6 sm:w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(path)}
              data-testid={`button-delete-${path.join('-')}`}
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Recursive Children Rendering */}
      <AnimatePresence>
        {isContainer && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col">
              {type === "array" ? (
                (data as JsonArray).map((item, index) => (
                  <JsonNode
                    key={`${index}-${JSON.stringify(item).slice(0, 20)}`} // somewhat stable key
                    data={item}
                    name={String(index)}
                    path={[...path, index]}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onRename={onRename}
                  />
                ))
              ) : (
                Object.entries(data as JsonObject).map(([key, value]) => (
                  <JsonNode
                    key={key}
                    data={value}
                    name={key}
                    path={[...path, key]}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onRename={onRename}
                  />
                ))
              )}
              
              {/* Empty State for Containers */}
              {(type === "array" ? (data as JsonArray).length === 0 : Object.keys(data as JsonObject).length === 0) && (
                 <div className="pl-4 sm:pl-6 py-1.5 sm:py-2 text-[10px] sm:text-xs text-muted-foreground/40 italic">
                   Empty {type}
                 </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
