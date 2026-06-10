"use client";

import React, { useRef, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Image,
  Minus,
  Eye,
  Edit3,
  Undo,
  Redo,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ToolbarAction = {
  icon: React.ReactNode;
  label: string;
  action: (
    textarea: HTMLTextAreaElement,
    value: string,
    onChange: (v: string) => void
  ) => void;
  separator?: boolean;
};

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  value: string,
  onChange: (v: string) => void,
  before: string,
  after: string,
  placeholder: string
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.substring(start, end);
  const replacement = `${before}${selected || placeholder}${after}`;
  const newValue =
    value.substring(0, start) + replacement + value.substring(end);
  onChange(newValue);

  // Restore cursor position
  requestAnimationFrame(() => {
    textarea.focus();
    const cursorPos = selected
      ? start + before.length + selected.length
      : start + before.length + placeholder.length;
    textarea.setSelectionRange(
      selected ? start + before.length : start + before.length,
      cursorPos
    );
  });
}

const toolbarActions: ToolbarAction[] = [
  {
    icon: <Bold className="w-4 h-4" />,
    label: "Bold",
    action: (ta, v, fn) => insertAtCursor(ta, v, fn, "**", "**", "bold text"),
  },
  {
    icon: <Italic className="w-4 h-4" />,
    label: "Italic",
    action: (ta, v, fn) => insertAtCursor(ta, v, fn, "*", "*", "italic text"),
  },
  {
    icon: <Heading1 className="w-4 h-4" />,
    label: "Heading 1",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "# " + v.substring(lineStart);
      fn(newValue);
    },
  },
  {
    icon: <Heading2 className="w-4 h-4" />,
    label: "Heading 2",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "## " + v.substring(lineStart);
      fn(newValue);
    },
  },
  {
    icon: <Heading3 className="w-4 h-4" />,
    label: "Heading 3",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "### " + v.substring(lineStart);
      fn(newValue);
    },
    separator: true,
  },
  {
    icon: <List className="w-4 h-4" />,
    label: "Unordered List",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "- " + v.substring(lineStart);
      fn(newValue);
    },
  },
  {
    icon: <ListOrdered className="w-4 h-4" />,
    label: "Ordered List",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "1. " + v.substring(lineStart);
      fn(newValue);
    },
  },
  {
    icon: <Quote className="w-4 h-4" />,
    label: "Blockquote",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const lineStart = v.lastIndexOf("\n", start - 1) + 1;
      const newValue = v.substring(0, lineStart) + "> " + v.substring(lineStart);
      fn(newValue);
    },
    separator: true,
  },
  {
    icon: <Code className="w-4 h-4" />,
    label: "Inline Code",
    action: (ta, v, fn) => insertAtCursor(ta, v, fn, "`", "`", "code"),
  },
  {
    icon: <Link className="w-4 h-4" />,
    label: "Link",
    action: (ta, v, fn) =>
      insertAtCursor(ta, v, fn, "[", "](url)", "link text"),
  },
  {
    icon: <Image className="w-4 h-4" />,
    label: "Image",
    action: (ta, v, fn) =>
      insertAtCursor(ta, v, fn, "![", "](url)", "alt text"),
  },
  {
    icon: <Minus className="w-4 h-4" />,
    label: "Horizontal Rule",
    action: (ta, v, fn) => {
      const start = ta.selectionStart;
      const newValue = v.substring(0, start) + "\n---\n" + v.substring(start);
      fn(newValue);
    },
  },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = React.useState<"edit" | "preview" | "split">(
    "split"
  );

  const handleAction = useCallback(
    (action: ToolbarAction["action"]) => {
      if (textareaRef.current) {
        action(textareaRef.current, value, onChange);
      }
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Tab key support
      if (e.key === "Tab") {
        e.preventDefault();
        const textarea = e.currentTarget;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue =
          value.substring(0, start) + "  " + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        });
      }
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        if (textareaRef.current) {
          insertAtCursor(
            textareaRef.current,
            value,
            onChange,
            "**",
            "**",
            "bold text"
          );
        }
      }
      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === "i") {
        e.preventDefault();
        if (textareaRef.current) {
          insertAtCursor(
            textareaRef.current,
            value,
            onChange,
            "*",
            "*",
            "italic text"
          );
        }
      }
    },
    [value, onChange]
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        {toolbarActions.map((action, i) => (
          <React.Fragment key={i}>
            <button
              type="button"
              onClick={() => handleAction(action.action)}
              title={action.label}
              className="p-1.5 rounded-md hover:bg-saffron/10 hover:text-saffron transition-colors text-warm"
            >
              {action.icon}
            </button>
            {action.separator && (
              <div className="w-px h-5 bg-border mx-1" />
            )}
          </React.Fragment>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mode toggle */}
        <div className="flex items-center gap-1 ml-2 border-l border-border pl-2">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`p-1.5 rounded-md transition-colors ${
              mode === "edit"
                ? "bg-saffron/15 text-saffron"
                : "text-warm hover:bg-saffron/10"
            }`}
            title="Edit only"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`p-1.5 rounded-md transition-colors ${
              mode === "split"
                ? "bg-saffron/15 text-saffron"
                : "text-warm hover:bg-saffron/10"
            }`}
            title="Split view"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`p-1.5 rounded-md transition-colors ${
              mode === "preview"
                ? "bg-saffron/15 text-saffron"
                : "text-warm hover:bg-saffron/10"
            }`}
            title="Preview only"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className="flex" style={{ minHeight: 400 }}>
        {(mode === "edit" || mode === "split") && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Start writing in Markdown... මාක්ඩවුන් හි ලියන්න පටන් ගන්න..."}
            className={`md-editor-textarea flex-1 p-4 bg-transparent resize-none focus:outline-none text-sm placeholder:text-warm-light/50 ${
              mode === "split" ? "border-r border-border" : ""
            }`}
            style={{ direction: "ltr", unicodeBidi: "plaintext" }}
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div
            className={`md-preview-content flex-1 p-4 overflow-y-auto custom-scrollbar ${
              mode === "split" ? "bg-muted/10" : ""
            }`}
          >
            {value ? (
              <ReactMarkdown>{value}</ReactMarkdown>
            ) : (
              <p className="text-warm-light/50 italic text-sm">
                Preview will appear here... පෙරදසුන මෙහි පෙන්වයි...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/20 text-xs text-warm-light font-ibm-mono">
        <span>
          {value.length} chars · {value.split(/\s+/).filter(Boolean).length}{" "}
          words
        </span>
        <span>Markdown · සිංහල / Unicode supported</span>
      </div>
    </div>
  );
}
