'use client';

import { useEditorStore } from '@/lib/editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HistoryPanel() {
  const history = useEditorStore((s) => s.history);
  const historyIndex = useEditorStore((s) => s.historyIndex);
  const jumpToHistory = useEditorStore((s) => s.jumpToHistory);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  return (
    <div className="w-60 bg-zinc-900 border-l border-t border-zinc-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <div className="flex items-center gap-1.5">
          <History size={14} className="text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300">History</span>
        </div>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={undo}
            disabled={historyIndex < 0}
            title="Undo"
          >
            <RotateCcw size={11} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <RotateCw size={11} />
          </Button>
        </div>
      </div>

      {/* History list */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {history.length === 0 ? (
            <div className="px-3 py-4 text-[10px] text-zinc-600 text-center">
              No history yet
            </div>
          ) : (
            history.map((entry, index) => {
              const isCurrent = index === historyIndex;
              const isPast = index < historyIndex;
              const isFuture = index > historyIndex;

              return (
                <button
                  key={`${index}-${entry.description}`}
                  className={`flex items-center gap-2 px-3 py-1.5 text-left w-full border-b border-zinc-800 transition-colors ${
                    isCurrent
                      ? 'bg-emerald-900/30 text-emerald-300 border-l-2 border-l-emerald-500'
                      : isFuture
                      ? 'text-zinc-600 hover:bg-zinc-800 hover:text-zinc-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                  onClick={() => jumpToHistory(index)}
                >
                  <span className="text-[10px] font-mono text-zinc-600 w-5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[11px] truncate flex-1">
                    {entry.description}
                  </span>
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  )}
                  {isFuture && (
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 flex-shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-1 border-t border-zinc-700">
        <span className="text-[10px] text-zinc-600">
          {historyIndex + 1} / {history.length} steps
        </span>
      </div>
    </div>
  );
}
