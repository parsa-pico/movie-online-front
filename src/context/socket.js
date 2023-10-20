import { useState, createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL;
export const SocketContext = createContext();
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  if (!socket) {
    const newSocket = io(SOCKET_URL, { autoConnect: false });
    setSocket(newSocket);
  }
  const connectSocket = async () => {
    await socket.connect();
  };

  return (
    <SocketContext.Provider value={{ socket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("Something went wrong!");
  }
  return context;
};
