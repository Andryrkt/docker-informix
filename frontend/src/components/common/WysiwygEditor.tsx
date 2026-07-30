import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Redo, Undo } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function WysiwygEditor({
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-24 px-3 py-2 focus:outline-none " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 " +
          "[&_.is-editor-empty:first-child]:before:text-gray-400 " +
          "[&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] " +
          "[&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:pointer-events-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "field-sizing-content min-h-16 w-full rounded-sm border border-input bg-transparent text-xs transition-colors outline-none placeholder:text-muted-foreground",
        "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50", // 👈
        "disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20",
        "dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b px-1.5 py-1">
        <ToolbarButton
          title="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Liste à puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Liste numérotée"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </ToolbarButton>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarButton
          title="Annuler"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          title="Rétablir"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
