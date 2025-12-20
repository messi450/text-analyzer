import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Loader2, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { checkGrammarGemini, isGeminiAvailable } from '@/api/geminiClient';

import { toast } from "sonner";

export default function GrammarChecker({ text, onApplyFix }) {
  const [isChecking, setIsChecking] = useState(false);
  const [errors, setErrors] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);

  const handleGrammarCheck = async () => {
    if (!text || text.trim().length < 10) {
      toast.error('Please enter at least 10 characters to check grammar');
      return;
    }

    if (!isGeminiAvailable()) {
      toast.error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
      return;
    }

    setIsChecking(true);
    try {
      const grammarErrors = await checkGrammarGemini(text);
      setErrors(grammarErrors);
      setHasChecked(true);

      if (grammarErrors.length === 0) {
        toast.success('No grammar errors found!');
      } else {
        toast.info(`Found ${grammarErrors.length} grammar issue${grammarErrors.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Failed to check grammar. Please try again.');
      console.error('Grammar check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyFix = (error, index) => {
    if (onApplyFix) {
      onApplyFix(error.original, error.suggested, index);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          Grammar Checker
        </h3>
        <Button
          onClick={handleGrammarCheck}
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {isChecking ? 'Checking...' : 'Check Grammar'}
        </Button>
      </div>

      {hasChecked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {errors.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">No grammar errors found!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your text appears to be grammatically correct.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <Badge variant={error.severity === 'high' ? 'destructive' : 'secondary'}>
                          {error.severity}
                        </Badge>
                        <span className="font-medium text-red-700">{error.title}</span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-red-600 line-through">"{error.original}"</span>
                        </div>
                        <div>
                          <span className="text-green-600">→ "{error.suggested}"</span>
                        </div>
                        <p className="text-gray-600 italic">{error.explanation}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleApplyFix(error, index)}
                      className="flex-shrink-0"
                    >
                      Apply Fix
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
