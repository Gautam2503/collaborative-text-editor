// A mock database with example users
const USER_INFO: Liveblocks["UserMeta"][] = [
  {
    id: "rounak.sen.21@aot.edu.in",
    info: {
      name: "Rounak Sen",
      color: "#D583F0",
      avatar: "https://liveblocks.io/avatars/avatar-1.png",
    },
  },
  {
    id: "swarnadeep.roy.21@aot.edu.in",
    info: {
      name: "Swarnadeep Roy",
      color: "#F08385",
      avatar: "https://liveblocks.io/avatars/avatar-2.png",
    },
  },
  {
    id: "gautam.nag.21@aot.edu.in",
    info: {
      name: "Gautam Nag",
      color: "#F0D885",
      avatar: "https://liveblocks.io/avatars/avatar-3.png",
    },
  },
  {
    id: "debjit.mukhopadhyay.21@aot.edu.in",
    info: {
      name: "Debjit Mukhopadhyay",
      color: "#85EED6",
      avatar: "https://liveblocks.io/avatars/avatar-4.png",
    },
  },
  {
    id: "ankur.sinharoy.21@aot.edu.in",
    info: {
      name: "Ankur Sinharoy",
      color: "#85BBF0",
      avatar: "https://liveblocks.io/avatars/avatar-5.png",
    },
  },
];

export function getRandomUser() {
  return USER_INFO[Math.floor(Math.random() * USER_INFO.length)];
}

export function getUser(id: string) {
  return USER_INFO.find((u) => u.id === id) || undefined;
}

export async function getUsers(ids: string[]) {
  return ids.map((id) => getUser(id));
}

export function getAllUsers() {
  return USER_INFO;
}
