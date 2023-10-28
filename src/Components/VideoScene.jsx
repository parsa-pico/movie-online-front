import React from "react";
import { useState, useRef, useEffect } from "react";
import { Button, Card } from "react-bootstrap";
import { useSocket } from "../context/socket";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import playIcon from "../icons/play.svg";
import pauseIcon from "../icons/pause.svg";
import gearIcon from "../icons/gear.svg";
import fullScreenIcon from "../icons/fullscreen.svg";
import { requestFullscreen, secondsToTime } from "../Common/commonFuncs";
import SRTCaptionViewer from "./SRTCaptionViewer";
import { toast, ToastContainer } from "react-toastify";
import Switch from "react-switch";
import SubtitleModal from "./SubtitleModal";
import MovieLinkModal from "./MovieLinkModal";
import ConfigsModal from "./ConfigsModal";
import MovieFrom from "./MovieFrom";
import Users from "./Users";

export default function VideoScene() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cacheAmount, setCacheAmount] = useState(-1);
  const [chooseFromFile, setChooseFromFile] = useState(true);
  const [videoFile, setVideoFile] = useState(null);
  const [subDelay, setSubDelay] = useState(0);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [newMovieLink, setNewMovieLink] = useState("");
  const [showVideo, setShowVideo] = useState(false);
  const [videoDurationFormatted, setVideoDurationFormatted] = useState("00:00");
  const [messages, setMessages] = useState([]);
  const [showMsgs, setShowMsgs] = useState(true);
  const [msgInputFocused, setMsgInputFocused] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const [msgCounter, setMsgCounter] = useState(5);
  const [showConfigsModal, setShowConfigsModal] = useState(false);
  const [currentUsers, setCurrentUsers] = useState([]);
  const handleReloadVideo = () => {
    // setVideoKey((prevKey) => prevKey + 1);
    videoRef.current.load();
  };

  useEffect(() => {
    if (msgCounter > 0)
      setTimeout(() => {
        setMsgCounter(msgCounter - 1);
      }, 1000);
    else {
      if (!msgInputFocused) {
        setShowMsgs(false);
        setMsgInputFocused(false);
      }
    }
  }, [msgCounter]);
  useEffect(() => {
    if (showMsgs && !msgInputFocused) setMsgCounter(5);
  }, [showMsgs]);

  useEffect(() => {
    const video = videoRef.current;
    video.currentTime = 0;
    setTime(0);
    setIsPlaying(false);
  }, [videoKey]);

  useEffect(() => {
    if (isPlaying) {
      console.log("is playing");
      videoRef.current.play();
    } else {
      console.log("is not playing");
      videoRef.current.pause();
    }
    console.log("video ref is paused: ", videoRef.current.paused);
  }, [isPlaying]);

  function defaultToast(msg, timeout = 1000) {
    toast(msg, { autoClose: timeout, rtl: true });
  }
  function getUserName() {
    let userName = searchParams.get("name");
    if (userName) return userName;
    if (!userName) {
      userName = prompt("لطفا یک نام کاربری دلخواه وارد کنید(به فارسی)");
      userName = userName.trim();
      if (userName)
        window.location =
          window.location.origin +
          window.location.pathname +
          `?name=${userName}`;
      else window.location = window.location.origin;
    }
  }
  useEffect(() => {
    async function run() {
      const userName = getUserName();

      if (socket.disconnected) await connectSocket();
      socket.on("connect", () => {
        console.log("connected to server");
        defaultToast("اتصال شما برقرار است");
        socket.emit("joinRoom", params.roomName, userName);
      });

      socket.on("disconnect ", () => {
        defaultToast("اتصال شما قطع شده است");
      });

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
        setShowSubModal(true);
      });
      socket.on("movieLink", (link) => {
        console.log("received a movie link");
        setNewMovieLink(link);
        setShowVideoModal(true);
      });
      socket.on("getUsers", (users) => {
        setCurrentUsers(users);
      });
      setInterval(() => {
        if (!socket.connected) defaultToast("اتصال شما قطع شده است");
      }, 10000);
    }

    run();

    return () => {
      if (socket) {
        removeSocketlisteners(
          "alert",
          "connect",
          "disconnet",
          "time",
          "subDelay",
          "subFile",
          "movieLink",
          "msg"
        );
        socket.emit("leaveRooms");
        socket.disconnect();
      }
    };
  }, []);
  function msgHandler(obj) {
    const msgsCopy = [...messages];
    msgsCopy.push(obj);
    setMessages(msgsCopy);
  }
  useEffect(() => {
    if (socket) socket.on("msg", msgHandler);
    return () => {
      socket.off("msg", msgHandler);
    };
  }, [messages]);
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
    if (cacheAmount === 0 && isPlaying) {
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
    if (isFullScreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    } else {
      requestFullscreen("fullscreen-wrapper");
      setIsFullScreen(true);
    }
  };
  function renderTime() {
    const t1 = secondsToTime(showedTime);
    const t2 = videoDurationFormatted;

    return `${t1} / ${t2}`;
  }

  function handleApplyNewLink() {
    try {
      setLink(newMovieLink);
      setVideoSrc(newMovieLink);
      handleReloadVideo();
      toast("در حال بارگذاری فیلم", { autoClose: 5000 });
      setShowVideoModal(false);
    } catch (error) {
      console.log(error);
      alert("لینک ارسالی اشکال دارد");
    }
  }

  function handleApplyNewSub() {
    try {
      setSrtText(newSub);
      setShowSubModal(false);
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
    if (newState === undefined) newState = !isPlaying;
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

    const { code } = e;
    console.log(code);
    if (code === "Space") {
      handlePlay();
      setShowControls(!showControls);
      setMsgInputFocused(!showControls);
      setShowMsgs(!showControls);
    } else if (code === "ArrowRight") goToNext(goToRate);
    else if (code === "ArrowLeft") goToNext(-goToRate);
    else if (code === "Period") handleSubDelay(subDelayRate);
    else if (code === "Comma") handleSubDelay(-subDelayRate);
  }
  function submitMovieSrc() {
    setShowVideo(false);
    if (!chooseFromFile) {
      socket.emit("movieLink", link);
      setVideoSrc(link);
    } else if (videoFile) {
      const videoObjectURL = URL.createObjectURL(videoFile);
      setVideoSrc(videoObjectURL);
    }
    toast("در حال بارگذاری فیلم", { autoClose: 5000 });

    handleReloadVideo();
  }
  function handleProgress(event) {
    const video = videoRef.current;

    if (video) {
      const currentTime = video.currentTime;
      const buffered = video.buffered;
      let loadedAfterCurrentTime = 0;
      // console.log("current time: ", currentTime);
      for (let i = 0; i < buffered.length; i++) {
        // console.log("start: ", buffered.start(i), " end:", buffered.end(i));
        if (buffered.start(i) <= currentTime && currentTime < buffered.end(i)) {
          loadedAfterCurrentTime += buffered.end(i) - currentTime;
        }
      }
      // console.log("---");
      setCacheAmount(parseInt(loadedAfterCurrentTime));
    }
  }
  function renderMsg() {
    const result = messages.slice(-3).map((msgObj, idx) => {
      return (
        <p key={idx}>
          {msgObj.name}:{msgObj.text}
        </p>
      );
    });
    return result;
  }
  function sendMsg() {
    if (msgInput) {
      socket.emit("msg", msgInput, msgHandler);
      setMsgInput("");
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
      <div className="scene-upper">
        <MovieFrom
          defaultToast={defaultToast}
          chooseFromFile={chooseFromFile}
          setChooseFromFile={setChooseFromFile}
          setVideoFile={setVideoFile}
          link={link}
          setLink={setLink}
          submitMovieSrc={submitMovieSrc}
          handleSrtChange={handleSrtChange}
        />
        <Users currentUsers={currentUsers} />
      </div>
      <div
        id="fullscreen-wrapper"
        className={isFullScreen ? "fullscreen-mode" : "not-fullscreen"}
      >
        <div
          tabIndex="-1"
          onKeyDown={handleKeyDown}
          id="video-container"
          className={showVideo ? "video-show" : "video-hide"}
        >
          <div className={showMsgs ? "msg-input" : "msg-input msg-hide"}>
            <input
              id="msg-input"
              value={msgInput}
              placeholder="چت کنید"
              onClick={(e) => {
                setMsgInputFocused(true);
              }}
              onChange={(e) => {
                setMsgInput(e.target.value);
              }}
              type="text"
              className="form-control"
            />
            <Button onClick={sendMsg}>ارسال</Button>
          </div>
          <div
            className={
              showMsgs ? "messages-wrapper" : "messages-wrapper msg-hide"
            }
          >
            {renderMsg()}
          </div>
          <video
            id="my-video"
            className={isFullScreen ? "full" : " "}
            // key={videoKey}
            ref={videoRef}
            onTimeUpdate={handleTimeUpdate}
            onProgress={handleProgress}
            onLoadedData={(e) => {
              console.log("on loaded data", e);
              videoRef.current.volume = 1;
              setShowVideo(true);
              const t = secondsToTime(videoRef.current.duration);
              setVideoDurationFormatted(t);
            }}
            onClick={(e) => {
              if (e.target.id === "my-video") {
                setShowControls(!showControls);
                setMsgInputFocused(!showControls);
                setShowMsgs(!showControls);
              }
            }}
          >
            <source src={videoSrc} />
          </video>
          <div className={showControls ? "controls" : "controls hide"}>
            <div className="control-time-wrapper">
              <h4 className="control-time ">{renderTime()}</h4>
              <h4>cache:{cacheAmount}s</h4>
            </div>
            <div className="upper-contorls">
              <img
                onClick={() => handlePlay()}
                className="btn-play icon-sm"
                src={isPlaying ? pauseIcon : playIcon}
              />
              <div>
                {!isFullScreen && (
                  <img
                    src={gearIcon}
                    style={{ marginRight: "1rem" }}
                    className="img-fluid icon-sm "
                    onClick={() => setShowConfigsModal(true)}
                  />
                )}
                <img
                  src={fullScreenIcon}
                  className="img-fluid icon-sm"
                  onClick={handleToggleFullscreen}
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={videoRef.current ? videoRef.current.duration.toString() : 0}
              step="1"
              value={currentTime}
              onMouseUp={() => {
                console.log("on mouse up");
                sendTime();
              }}
              onTouchEnd={() => {
                console.log("on touch end");
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

          <SRTCaptionViewer
            currentTime={currentTime}
            subDelay={subDelay}
            videoRef={videoRef}
            srtText={srtText}
          />

          <SubtitleModal
            show={showSubModal}
            setShow={setShowSubModal}
            handleCancel={() => {
              setNewSub("");
              setShowSubModal(false);
            }}
            handleApply={handleApplyNewSub}
          />
          <MovieLinkModal
            show={showVideoModal}
            handleCancel={() => {
              setNewMovieLink("");
              setShowVideoModal(false);
            }}
            handleApply={handleApplyNewLink}
          />
        </div>
        <ToastContainer className="video-toast" />
        <ConfigsModal
          show={showConfigsModal}
          handleClose={() => setShowConfigsModal(false)}
        />
      </div>
    </div>
  );
}
