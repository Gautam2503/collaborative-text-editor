"use client";

import NotificationsPopover from "../notifications-popover";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import {
  useLiveblocksExtension,
  FloatingComposer,
  FloatingThreads,
  AnchoredThreads,
  Toolbar,
  FloatingToolbar,
} from "@liveblocks/react-tiptap";
import StarterKit from "@tiptap/starter-kit";
import { useThreads } from "@liveblocks/react";
import { useIsMobile } from "./use-is-mobile";
import VersionsDialog from "../version-history-dialog";
import { useState, useEffect } from "react";
import axios from "axios";

export default function TiptapEditor({ userId, workspaceId, fileId, filename, initialContent }:
  { userId: string, workspaceId: string, fileId: string, filename: string, initialContent: any }) {
  const liveblocks = useLiveblocksExtension();


  // {
  //   type: "doc",
  //   content: [
  //     {
  //       type: "paragraph",
  //       content: [
  //         {
  //           type: "text",
  //           text: "Hello, this is the initial content!",
  //         },
  //       ],
  //     },
  //   ],
  // });

  const editor = useEditor({
    editorProps: {
      attributes: {
        // Add styles to editor element
        class: "outline-none flex-1 transition-all",
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
      liveblocks,
    ],
    content: initialContent,
  });

  // useEffect(() => {
  //   console.log("Editor content:", editor?.getHTML());
  //   if (editor && initialContent) {
  //     editor.commands.setContent(initialContent);
  //   }
  // }, [editor, initialContent]);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="h-[60px] flex items-center justify-between px-4 border-b border-border/80 bg-background">
        <a 
          href={'https://dms-frontend-liard.vercel.app'}
          className="text-blue-600  text-sm font-medium ml-4"
        >
          {process.env.image}
        </a>
        <div className="flex items-center">
        <button
          type="submit"
          className="bg-primary-foreground p-2 m-5 rounded-md text-primary text-sm font-semibold"
          onClick={async () => {
            if (!editor) return;

            // Get document as JSON
            const json = editor.getJSON();
            console.log(`Document JSON: ${JSON.stringify(json)}`);

            try {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/upload/${userId}/${workspaceId}?filename=${encodeURIComponent(filename)}&fileId=${encodeURIComponent(fileId)}`,
                JSON.stringify(json),
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              alert(`File saved successfully: ${filename}`);
            } catch (error) {
              console.error('Error:', error);
              if (axios.isAxiosError(error)) {
                console.error('Error response:', error.response);
                console.error('Error data:', error.response?.data);
              }
            }
          }}
        >
          Save
        </button>


          <VersionsDialog editor={editor} fileId={fileId} />
          <NotificationsPopover />
        </div>
      </div>
      <div className="border-b border-border/80 bg-background">
        <Toolbar editor={editor} className="w-full" />
      </div>
      <div className="relative flex flex-row justify-between w-full py-16 xl:pl-[250px] pl-[100px] gap-[50px]">
        <div className="relative flex flex-1 flex-col gap-2">
          <EditorContent editor={editor} />
          <FloatingComposer editor={editor} className="w-[350px]" />
          <FloatingToolbar editor={editor} />
        </div>

        <div className="xl:[&:not(:has(.lb-tiptap-anchored-threads))]:pr-[200px] [&:not(:has(.lb-tiptap-anchored-threads))]:pr-[50px]">
          <Threads editor={editor} />
        </div>
      </div>
    </div>
  );
}

function Threads({ editor }: { editor: Editor | null }) {
  const { threads } = useThreads();
  const isMobile = useIsMobile();

  if (!threads || !editor) {
    return null;
  }

  return isMobile ? (
    <FloatingThreads threads={threads} editor={editor} />
  ) : (
    <AnchoredThreads
      threads={threads}
      editor={editor}
      className="w-[350px] xl:mr-[100px] mr-[50px]"
    />
  );
}
