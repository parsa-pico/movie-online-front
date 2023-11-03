import React, { useEffect, useState } from "react";
import { useSocket } from "../context/socket";

export default function Test() {
  const { socket, connectSocket } = useSocket();
  async function run() {
    if (socket.disconnected) await connectSocket();
    const time = 1000;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      let madiaRecorder = new MediaRecorder(stream);
      madiaRecorder.start();

      let audioChunks = [];

      madiaRecorder.addEventListener("dataavailable", function (event) {
        audioChunks.push(event.data);
      });

      madiaRecorder.addEventListener("stop", function () {
        let audioBlob = new Blob(audioChunks);

        audioChunks = [];

        let fileReader = new FileReader();
        fileReader.readAsDataURL(audioBlob);
        fileReader.onloadend = function () {
          let base64String = fileReader.result;
          socket.emit("voice", base64String);
        };

        madiaRecorder.start();

        setTimeout(function () {
          madiaRecorder.stop();
        }, time);
      });

      setTimeout(function () {
        madiaRecorder.stop();
      }, time);
    });

    socket.on("send", function (data) {
      let audio = new Audio(data);
      audio.play();
    });
  }

  useEffect(() => {
    run();
    return () => {
      //   audioStream && audioStream.getTracks().forEach((track) => track.stop());
      socket.off("send");
    };
  }, []);

  return <div></div>;
}
