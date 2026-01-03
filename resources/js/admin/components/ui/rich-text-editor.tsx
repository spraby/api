import * as React from 'react';

import Underline from '@tiptap/extension-underline';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MenuBar = ({ editor }: { editor: Editor }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = 'size-8 p-0';

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/50 px-2 py-1.5">
      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        size="icon"
        type="button"
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" />
      </Button>

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        size="icon"
        type="button"
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" />
      </Button>

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        size="icon"
        type="button"
        variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="size-4" />
      </Button>

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        size="icon"
        type="button"
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="size-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleBulletList().run()}
        size="icon"
        type="button"
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="size-4" />
      </Button>

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        size="icon"
        type="button"
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" />
      </Button>

      <div className="mx-1 h-6 w-px bg-border" />

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().undo().run()}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo className="size-4" />
      </Button>

      <Button
        className={buttonClass}
        disabled={!editor.can().chain().focus().redo().run()}
        size="icon"
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo className="size-4" />
      </Button>
    </div>
  );
};

const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value = '', onChange, placeholder, disabled = false, className }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          code: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
        }),
        Underline,
      ],
      content: value,
      editable: !disabled,
      editorProps: {
        attributes: {
          class: cn(
            'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
            'dark:prose-invert',
            '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6',
            disabled && 'opacity-50 cursor-not-allowed'
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();

        onChange?.(html);
      },
    });

    // Update editor content when value prop changes externally
    React.useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    // Update editable state when disabled prop changes
    React.useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [disabled, editor]);

    if (!editor) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full flex-col rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <MenuBar editor={editor} />
        <EditorContent
          className="rich-text-editor-content"
          editor={editor}
          placeholder={placeholder}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };