import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getToken } from "./Services/authService";
import { useEffect, useState } from "react";
import VideoScene from "./Components/VideoScene";
import Room from "./Components/Room";
import { useSocket } from "./context/socket";

function App() {
  const loc = useLocation();
  const { socket } = useSocket();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [loc]);

  useEffect(() => {
    if (socket)
      socket.on("error", (err) => {
        alert(err.msg);
      });

    return () => {
      if (socket && socket.connected) socket.disconnect();
      socket.removeAllListeners("error");
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" exact element={<Room />} />
        <Route path="/:roomName" exact element={<VideoScene />} />
      </Routes>
    </div>
  );
}

export default App;
