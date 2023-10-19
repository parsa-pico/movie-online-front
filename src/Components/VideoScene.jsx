import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useSocket } from "../context/socket";
import { useLocation } from "react-router-dom";
import playIcon from "../icons/play.svg";
import pauseIcon from "../icons/pause.svg";
import fullScreenIcon from "../icons/fullscreen.svg";
import { secondsToTime, toggleFullScreen } from "../Common/commonFuncs";
import SRTCaptionViewer from "./SRTCaptionViewer";
import { toast, ToastContainer } from "react-toastify";

export default function VideoScene() {
  const [srtText, setSrtText] = useState(null);
  const location = useLocation();
  const { socket, connectSocket } = useSocket();
  const [link, setLink] = useState("");
  const [videoSrc, setVideoSrc] = useState(link);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoKey, setVideoKey] = useState(0);
  const isPlaying = useRef(false);
  const [showControls, setShowControls] = useState(true);
  const [showedTime, setShowedTime] = useState(0);
  const videoFocused = useRef(false);
  const handleReloadVideo = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  // useEffect(() => {
  //   async function run() {
  //     console.log("hi");
  //     if (isPlaying.current) await videoRef.current.play();
  //     else videoRef.current.pause();
  //   }
  //   run();
  // }, [isPlaying.current]);

  useEffect(() => {
    handleControlsWidth();
  }, [videoKey]);

  useEffect(() => {
    window.addEventListener("resize", handleControlsWidth);

    connectSocket(() => {
      socket.on("connect", () => {
        console.log("connected to server");
        toast("اتصال شما برقرار است");
      });
      socket.on("disconnect ", () => {
        toast("اتصال شما قطع شده است");
      });
      socket.emit("joinRoom", location.pathname);
      socket.on("time", async (time, t1, isPlaying) => {
        console.log("a user changed time");
        const videoElement = videoRef.current;

        if (isPlaying) setIsPlaying(true);
        else setIsPlaying(false);

        const t2 = Date.now();
        const delay = isPlaying.current ? (t2 - t1) / 1000.0 : 0;

        videoElement.currentTime = time + delay;
      });
      socket.on("alert", (msg) => {
        toast(msg, { rtl: true, autoClose: 1000 });
      });
    });

    setInterval(() => {
      if (!socket.connected) toast("اتصال شما قطع شده است");
    }, 5000);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleVideoFocus);
    return () => {
      if (socket) socket.removeAllListeners();
      window.removeEventListener("resize", handleControlsWidth);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("handleVideoFocus", handleKeyDown);
    };
  }, []);
  function handleVideoFocus(e) {
    if (e.target.id === "my-video") {
      videoFocused.current = true;
    } else videoFocused.current = false;
  }
  function sendTime(playing = isPlaying.current) {
    if (socket) {
      const targetTime = videoRef.current.currentTime;
      console.log("you changed time");
      const t1 = Date.now();
      socket.emit("time", targetTime, t1, playing);
    }
  }
  function setTime(time) {
    setCurrentTime(time);
    setShowedTime(time);
  }
  const handleSeekBarChange = (e) => {
    const newTime = e.target.value;
    videoRef.current.currentTime = newTime;
    setTime(newTime);

    sendTime();
  };

  const handleTimeUpdate = () => {
    setTime(videoRef.current.currentTime);
  };

  function handleControlsWidth() {
    const videoElement = videoRef.current;

    const controlsElement = document.querySelector(".controls");
    if (videoElement && controlsElement) {
      controlsElement.style.maxWidth = `${videoElement.offsetWidth}px`;
    }
  }

  const handleToggleFullscreen = () => {
    toggleFullScreen("video-container");
    setTimeout(() => {
      handleControlsWidth();
    }, 1);
  };
  function renderTime() {
    let t2 = videoRef.current ? videoRef.current.duration : 0;
    const t1 = secondsToTime(showedTime, t2);
    t2 = secondsToTime(t2);
    return `${t1} / ${t2}`;
  }
  const handleSrtChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;

      setSrtText(content);
    };

    reader.readAsText(file);
  };
  function handleHoverTime(e) {
    let poistion =
      parseInt(e.target.getAttribute("max")) / e.target.offsetWidth;
    poistion = e.nativeEvent.offsetX * poistion;
    setShowedTime(poistion);
  }
  function setIsPlaying(state) {
    isPlaying.current = state;
    if (isPlaying.current) videoRef.current.play();
    else videoRef.current.pause();
  }
  function handlePlay() {
    const newState = !isPlaying.current;
    setIsPlaying(newState);

    sendTime(newState);
  }
  function handleKeyDown(e) {
    if (videoFocused.current) {
      const { code } = e;
      console.log(code);
      if (code === "Space") {
        handlePlay();
      }
    }
  }

  return (
    <div className="flex-col">
      <input
        type="text"
        placeholder="link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />

      <Button
        onClick={() => {
          setVideoSrc(link);
          handleReloadVideo();
        }}
      >
        ثبت
      </Button>
      <input type="file" accept=".srt" onChange={handleSrtChange} />
      <div id="video-container">
        <video
          id="my-video"
          className="img-fluid "
          key={videoKey}
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={handleControlsWidth}
          onClick={(e) => {
            if (e.target.id === "my-video") {
              setShowControls(!showControls);
            }
          }}
        >
          <source src={videoSrc} />
        </video>

        <div className={showControls ? "controls" : "controls hide"}>
          <h4 className="control-time">{renderTime()}</h4>
          <div className="upper-contorls">
            <img
              onClick={handlePlay}
              className="btn-play "
              src={isPlaying.current ? pauseIcon : playIcon}
            />
            <img
              src={fullScreenIcon}
              className="img-fluid icon-sm"
              onClick={handleToggleFullscreen}
            />
          </div>
          <input
            type="range"
            min="0"
            max={videoRef.current ? videoRef.current.duration.toString() : 0}
            step="1"
            value={currentTime}
            onChange={handleSeekBarChange}
            className="video-range w-100"
            onMouseMove={handleHoverTime}
            onMouseLeave={() => {
              setShowedTime(currentTime);
            }}
          />
        </div>
        {srtText && <SRTCaptionViewer videoRef={videoRef} srtText={srtText} />}
        <ToastContainer />
      </div>
    </div>
  );
}