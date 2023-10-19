import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { getToken } from "./Services/authService";
import { useEffect, useState } from "react";
import VideoScene from "./Components/VideoScene";
import Room from "./Components/Room";

function App() {
  const loc = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [loc]);

  useEffect(() => {
    // socket.on("connect", () => {
    //   console.log("Connected to server");
    // });
    // socket.on("error", (err) => {
    //   alert(err.msg);
    // });
    // return () => {
    //   if (socket.connected) socket.disconnect();
    //   socket.removeAllListeners();
    // };
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
