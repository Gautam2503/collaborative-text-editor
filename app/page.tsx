"use client";

import Loading from "./loading";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { useSearchParams } from "next/navigation";
import Editor from "./tiptap/editor";
import axios from "axios";
import { useEffect, useState } from "react";

// Learn how to structure your collaborative Next.js app
// https://liveblocks.io/docs/guides/how-to-use-liveblocks-with-nextjs-app-directory

export default function Page() {
  const params = useSearchParams();
  const userId = params?.get("userId");
  const workspaceId = params?.get("workspaceId");
  const fileId = params?.get("fileId");
  const filename = params?.get("filename");

  const [initialContent, setInitialContent] = useState(null);

  if (!userId || !workspaceId || !fileId || !filename) {
    return <div>Missing parameters</div>
  }

  const roomId = (!userId || !workspaceId) ? "liveblocks:examples:nextjs-tiptap" : `liveblocks:examples:${userId}-${workspaceId}`;

  useEffect(() => {
    (async () => {
      if (initialContent != null) {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/file?file_id=${fileId}&user_id=${userId}`);
        if (response.status !== 200) {
          throw new Error("Problem fetching file url from server");
        }
        const url = response.data;
        const response2 = await axios.get(`/api/download?url=${encodeURIComponent(url)}`);
        if (response2.status !== 200) {
          throw new Error("Problem fetching file");
        }
        const json = await response2.data.json();
        setInitialContent(json);
      }
    })();
  }, []);

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveUsers={async ({ userIds }) => {
        const searchParams = new URLSearchParams(
          userIds.map((liveblocksUserId) => ["userIds", liveblocksUserId])
        );
        const response = await fetch(`/api/users?${searchParams}`);

        if (!response.ok) {
          throw new Error("Problem resolving users");
        }

        const users = await response.json();
        return users;
      }}
      resolveMentionSuggestions={async ({ text }) => {
        const response = await fetch(
          `/api/users/search?text=${encodeURIComponent(text)}`
        );

        if (!response.ok) {
          throw new Error("Problem resolving mention suggestions");
        }

        const userIds = await response.json();
        return userIds;
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
        }}
      >
        <ClientSideSuspense fallback={<Loading />}>
          <Editor userId={userId} workspaceId={workspaceId} fileId={fileId} filename={filename} initialContent={initialContent} />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

/**
 * This function is used when deploying an example on liveblocks.io.
 * You can ignore it completely if you run the example locally.
 */
