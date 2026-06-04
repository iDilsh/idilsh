'use client';

import { useState, useCallback, useRef } from 'react';
import { useEditorStore } from '@/lib/editor-store';
import { X, Plus, FileImage } from 'lucide-react';

export default function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTabId = useEditorStore((s) => s.setActiveTabId);
  const removeTab = useEditorStore((s) => s.removeTab);
  const renameTab = useEditorStore((s) => s.renameTab);
  const newProject = useEditorStore((s) => s.newProject);

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback((tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditValue(currentName);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleFinishEdit = useCallback(() => {
    if (editingTabId && editValue.trim()) {
      renameTab(editingTabId, editValue.trim());
    }
    setEditingTabId(null);
  }, [editingTabId, editValue, renameTab]);

  const handleAddTab = useCallback(() => {
    newProject(1920, 1080, 'Untitled');
  }, [newProject]);

  return (
    <div className="h-7 bg-zinc-800 border-b border-zinc-700 flex items-stretch overflow-x-auto custom-scrollbar tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`group flex items-center gap-1 px-3 min-w-[120px] max-w-[200px] cursor-pointer border-r border-zinc-700 select-none ${
              isActive
                ? 'bg-zinc-700 text-zinc-100'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-300'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {/* PSD icon badge */}
            {tab.isPsd && (
              <FileImage size={11} className="text-amber-400 flex-shrink-0" />
            )}

            {/* Modified indicator */}
            {tab.modified && !isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            )}

            {/* Tab name */}
            {editingTabId === tab.id ? (
              <input
                ref={inputRef}
                className="bg-zinc-600 text-zinc-200 text-xs px-1 py-0 rounded outline-none border border-zinc-500 flex-1 min-w-0"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleFinishEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFinishEdit();
                  if (e.key === 'Escape') setEditingTabId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-xs truncate flex-1 min-w-0"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  handleDoubleClick(tab.id, tab.name);
                }}
              >
                {tab.name}
              </span>
            )}

            {/* Close button */}
            <button
              className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-sm transition-colors ${
                isActive
                  ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600'
                  : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700'
              } opacity-0 group-hover:opacity-100`}
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              title="Close tab"
            >
              <X size={10} />
            </button>
          </div>
        );
      })}

      {/* Add tab button */}
      <button
        className="flex items-center justify-center w-7 h-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700 flex-shrink-0 transition-colors"
        onClick={handleAddTab}
        title="New tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
