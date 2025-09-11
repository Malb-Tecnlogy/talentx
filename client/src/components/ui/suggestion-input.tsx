import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface SuggestionInputProps {
  value?: string | number;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  type?: "text" | "number";
  className?: string;
  "data-testid"?: string;
}

export function SuggestionInput({
  value,
  onChange,
  suggestions,
  placeholder,
  type = "text",
  className,
  "data-testid": testId,
}: SuggestionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [inputValue, setInputValue] = useState(value?.toString() || "");

  useEffect(() => {
    if (value !== undefined && value !== "") {
      setInputValue(value.toString());
      setShowSuggestions(false);
    }
  }, [value]);

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // Hide suggestions if user starts typing
    if (newValue.length > 0) {
      setShowSuggestions(false);
    }
  };

  const handleInputFocus = () => {
    // Show suggestions again if field is empty
    if (!inputValue || inputValue === "") {
      setShowSuggestions(true);
    }
  };

  const clearInput = () => {
    setInputValue("");
    onChange("");
    setShowSuggestions(true);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={type}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={className}
          data-testid={testId}
          inputMode={type === "number" ? "numeric" : undefined}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "1" : undefined}
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            onClick={clearInput}
            data-testid={`${testId}-clear`}
          >
            <X size={12} />
          </Button>
        )}
      </div>
      
      {showSuggestions && (!inputValue || inputValue === "") && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center">Suggested:</span>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleSuggestionClick(suggestion)}
              data-testid={`${testId}-suggestion-${index}`}
            >
              <Check size={12} className="mr-1" />
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}