import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useSocket } from "../context/socket";
import { useLocation, useNavigate } from "react-router-dom";
import playIcon from "../icons/play.svg";
import pauseIcon from "../icons/pause.svg";
import fullScreenIcon from "../icons/fullscreen.svg";
import { requestFullscreen, secondsToTime } from "../Common/commonFuncs";
import SRTCaptionViewer from "./SRTCaptionViewer";
import { toast, ToastContainer } from "react-toastify";
import Switch from "react-switch";
import ReactPlayer from "react-player";
import SubtitleModal from "./SubtitleModal";

export default function VideoScene() {
  const [srtText, setSrtText] = useState(null);
  const nav = useNavigate();
  const location = useLocation();
  const { socket, connectSocket } = useSocket();
  const [link, setLink] = useState("/test.mkv");
  const [videoSrc, setVideoSrc] = useState(link);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoKey, setVideoKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showedTime, setShowedTime] = useState(0);
  const [keysEnabled, setKeysEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cacheAmount, setCacheAmount] = useState(0);
  const [chooseFromFile, setChooseFromFile] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [subDelay, setSubDelay] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoDurationFormatted, setVideoDurationFormatted] = useState("00:00");
  const handleReloadVideo = () => {
    setVideoKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const video = videoRef.current;
    video.currentTime = 0;
    setTime(0);
    setIsPlaying(false);
  }, [videoKey]);
  useEffect(() => {
    async function run() {
      if (isPlaying) await videoRef.current.play();
      else await videoRef.current.pause();
    }
    run();
  }, [isPlaying]);

  function defaultToast(msg, timeout = 1000) {
    toast(msg, { autoClose: timeout, rtl: true });
  }
  useEffect(() => {
    async function run() {
      await connectSocket();
      socket.on("connect", () => {
        console.log("connected to server");
        defaultToast("اتصال شما برقرار است");
      });

      socket.on("disconnect ", () => {
        defaultToast("اتصال شما قطع شده است");
      });
      socket.emit(
        "joinRoom",
        location.pathname,
        (location.state && location.state.name) || "کاربر مهمان"
      );
      socket.on("time", async (time, t1, playing) => {
        console.log("a user changed time");
        const videoElement = videoRef.current;

        if (playing) setIsPlaying(true);
        else setIsPlaying(false);

        const t2 = Date.now();
        const delay = playing ? (t2 - t1) / 1000.0 : 0;
        time = time + delay;
        toast.info(
          `${playing ? "playing" : "paused"} at ${secondsToTime(time)}`,
          {
            autoClose: 1500,
            position: "top-left",
            theme: "dark",
          }
        );
        videoElement.currentTime = time;
      });
      socket.on("subDelay", (delay) => {
        setSubDelay(delay);
        infoToast(`a user changed subtitle delay : ${delay}`, 1000);
      });
      socket.on("alert", (msg) => {
        defaultToast(msg);
      });
      socket.on("subFile", (file) => {
        console.log("received a sub");
        setNewSub(file);
        setShowModal(true);
      });
      setInterval(() => {
        if (!socket.connected) defaultToast("اتصال شما قطع شده است");
      }, 10000);
    }

    run();

    return () => {
      if (socket) {
        removeSocketlisteners("alert", "connect", "disconnet", "time");

        socket.disconnect();
      }
    };
  }, []);
  useEffect(() => {
    function preventSpace(e) {
      if (e.keyCode == 32 && e.target.id === "video-container") {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", preventSpace);
    return () => {
      window.removeEventListener("keydown", preventSpace);
    };
  }, []);
  useEffect(() => {
    if (cacheAmount === 0) {
      handlePlay(false);
    }
  }, [cacheAmount]);
  function infoToast(msg, autoClose = 1500) {
    toast.info(msg, {
      autoClose,
      position: "top-left",
      theme: "dark",
    });
  }
  function removeSocketlisteners(...listeners) {
    listeners.forEach((l) => socket.removeAllListeners(l));
  }
  function sendTime(playing = isPlaying) {
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
  };

  const handleTimeUpdate = () => {
    setTime(videoRef.current.currentTime);
  };
  function goToNext(sec) {
    const newTime = currentTime + sec;
    videoRef.current.currentTime = newTime;
    setTime(newTime);
    sendTime();
  }

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullScreen(false);
      return;
    }
    requestFullscreen("video-container");
    setIsFullScreen(true);
  };
  function renderTime() {
    const t1 = secondsToTime(showedTime);
    const t2 = videoDurationFormatted;

    return `${t1} / ${t2}`;
  }

  function handleApplyNewSub() {
    try {
      setSrtText(newSub);
      setShowModal(false);
    } catch (error) {
      console.log(error);
      alert("زیرنویس ارسالی اشکال دارد");
    }
  }

  const handleSrtChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const content = reader.result;

      socket.emit("subFile", content);
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

  function handlePlay(newState) {
    console.log(newState);
    if (newState === undefined) newState = !isPlaying;

    console.log(newState);
    setIsPlaying(newState);
    sendTime(newState);
  }
  function handleSubDelay(delay) {
    if (!srtText) return;
    const totalDelay = subDelay + delay;
    setSubDelay(totalDelay);
    infoToast(`subtitle delay : ${totalDelay}`, 1000);
    socket.emit("subDelay", totalDelay);
  }
  function handleKeyDown(e) {
    const subDelayRate = 0.5;
    const goToRate = 5;
    if (keysEnabled) {
      const { code } = e;
      console.log(code);
      if (code === "Space") {
        handlePlay();
        setShowControls(!showControls);
      } else if (code === "ArrowRight") goToNext(goToRate);
      else if (code === "ArrowLeft") goToNext(-goToRate);
      else if (code === "Period") handleSubDelay(subDelayRate);
      else if (code === "Comma") handleSubDelay(-subDelayRate);
    }
  }
  function submitMovieSrc() {
    setShowVideo(false);
    if (!chooseFromFile) setVideoSrc(link);
    else if (videoFile) {
      const videoObjectURL = URL.createObjectURL(videoFile);
      setVideoSrc(videoObjectURL);
    }
    handleReloadVideo();
  }
  function handleProgress(event) {
    const video = videoRef.current;

    if (video) {
      const currentTime = video.currentTime;
      const buffered = video.buffered;
      let loadedAfterCurrentTime = 0;
      console.log("current time: ", currentTime);
      for (let i = 0; i < buffered.length; i++) {
        console.log("start: ", buffered.start(i), " end:", buffered.end(i));
        if (buffered.start(i) <= currentTime && currentTime < buffered.end(i)) {
          loadedAfterCurrentTime += buffered.end(i) - currentTime;
        }
      }
      console.log("---");
      setCacheAmount(parseInt(loadedAfterCurrentTime));
    }
  }
  return (
    <div id="video-page">
      <Button
        onClick={() => (window.location = "/")}
        variant="secondary"
        className="video-back"
      >
        بازگشت
      </Button>

      <div className="video-configs">
        <div className="load-from-wrapper">
          <h5>بارگذاری فیلم </h5>
          <div className="flex-row">
            <p>از فایل</p>
            <Switch
              checked={chooseFromFile}
              onChange={(checked) => setChooseFromFile(checked)}
            />
            <p>از لینک</p>
          </div>
        </div>
        {chooseFromFile && (
          <div className="mb-3">
            <label> فایل فیلم</label>
            <input
              dir="ltr"
              type="file"
              accept="video/*"
              className="form-control "
              onChange={(e) => setVideoFile(e.target.files[0])}
            />
          </div>
        )}
        {!chooseFromFile && (
          <div className="mb-3">
            <label> لینک فیلم</label>
            <input
              dir="ltr"
              type="text"
              placeholder="link"
              value={link}
              className="form-control "
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
        )}
        <Button variant="primary" className="mb-5" onClick={submitMovieSrc}>
          ثبت
        </Button>
        <div className="mb-4">
          <label htmlFor="">بارگذاری زیرنویس</label>
          <input
            className="form-control "
            type="file"
            accept=".srt"
            onChange={handleSrtChange}
          />
        </div>
        {/* <div className="key-enable">
          <label>فعال کردن کیبورد</label>
          <Switch
            checked={keysEnabled}
            onChange={(checked) => setKeysEnabled(checked)}
          />
        </div> */}
      </div>
      <div
        tabIndex="-1"
        onKeyDown={handleKeyDown}
        id="video-container"
        className={showVideo ? "video-show" : "video-hide"}
      >
        <video
          id="my-video"
          className={isFullScreen ? "full" : " "}
          key={videoKey}
          ref={videoRef}
          onTimeUpdate={handleTimeUpdate}
          onProgress={handleProgress}
          onLoadedData={(e) => {
            setShowVideo(true);
            const t = secondsToTime(videoRef.current.duration);
            setVideoDurationFormatted(t);
          }}
          onClick={(e) => {
            if (e.target.id === "my-video") {
              setShowControls(!showControls);
            }
          }}
        >
          <source src={videoSrc} />
        </video>

        <div className={showControls ? "controls" : "controls hide"}>
          <div className="control-time-wrapper">
            <h4 className="control-time">{renderTime()}</h4>
            <h4>cache:{cacheAmount}s</h4>
          </div>
          <div className="upper-contorls">
            <img
              onClick={() => handlePlay()}
              className="btn-play icon-sm"
              src={isPlaying ? pauseIcon : playIcon}
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
            onMouseUp={(e) => {
              sendTime();
            }}
            onChange={handleSeekBarChange}
            className="form-range video-range"
            onMouseMove={handleHoverTime}
            onMouseLeave={() => {
              setShowedTime(currentTime);
            }}
          />
        </div>
        {srtText && (
          <SRTCaptionViewer
            currentTime={currentTime}
            subDelay={subDelay}
            videoRef={videoRef}
            srtText={srtText}
          />
        )}
        <ToastContainer />
        <SubtitleModal
          show={showModal}
          setShow={setShowModal}
          handleCancel={() => {
            setNewSub("");
            setShowModal(false);
          }}
          handleApply={handleApplyNewSub}
        />
      </div>
    </div>
  );
}
