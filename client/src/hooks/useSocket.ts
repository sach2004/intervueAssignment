import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
}
