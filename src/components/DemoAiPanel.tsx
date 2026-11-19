
import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Task } from '../types/task';

interface Props {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onUpdateDeadline: (id: string, deadline: string) => void;
  onAddSuggestedTask: (input: any) => void;
  expanded?: boolean;
}

export const DemoAiPanel: React.FC<Props> = ({ tasks }) => {
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSuggestions = async () => {
    setLoading(true);
    setError('');
    setSuggestions('');

    try {
      const response = await fetch('/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI request failed');
      }

      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#1F273D] bg-[#121726] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="text-violet-400" />
        <h2 className="text-base font-semibold text-white">
          Gemini AI Assistant
        </h2>
      </div>

      <button
        onClick={generateSuggestions}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white disabled:opacity-50"
      >
        <RefreshCw size={16} />
        {loading ? 'Thinking...' : 'Generate AI Suggestions'}
      </button>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      {suggestions && (
        <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-200">
          {suggestions}
        </div>
      )}
    </section>
  );
};
