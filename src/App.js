import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getToken } from "./Services/authService";
import { useEffect, useState } from "react";
import VideoScene from "./Components/VideoScene";
import Room from "./Components/Room";
import { useSocket } from "./context/socket";
import Test from "./Components/Test";

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
        <Route path="/" exact element={<Navigate to={"/room"} />} />
        <Route path="/room" exact element={<Room />} />
        <Route path="/room/:roomName" exact element={<VideoScene />} />
        <Route path="/test" exact element={<Test />} />
      </Routes>
    </div>
  );
}

export default App;
