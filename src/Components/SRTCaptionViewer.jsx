import React, { useState, useEffect } from "react";

const SRTCaptionViewer = ({ srtText, videoRef }) => {
  const [captions, setCaptions] = useState([]);
  const [captionsMap, setCaptionsMap] = useState({});
  const [currentCaption, setCurrentCaption] = useState("");

  useEffect(() => {
    const parseSRT = (srtText) => {
      const captionBlocks = srtText.split("\r\n\r\n");

      const parsedCaptions = captionBlocks.map((block) => {
        try {
          const [_, time, ...textLines] = block.split("\r\n").filter(Boolean);

          const [startTime, endTime] = time.split(" --> ").map(parseTime);

          const text = textLines.join("<br/>");
          return { startTime, endTime, text };
        } catch (error) {
          console.log(error);
          return { startTime: Infinity, endTime: Infinity + 1, text: "" };
        }
      });

      return parsedCaptions;
    };

    const parseTime = (timeString) => {
      const [hours, minutes, seconds] = timeString
        .replace(",", ".")
        .split(":")
        .map(parseFloat);
      const time = hours * 3600 + minutes * 60 + seconds;

      return time;
    };
    if (!srtText) return;
    try {
      const captionsData = parseSRT(srtText);

      setCaptions(captionsData);

      const capMap = {};
      captionsData.forEach((caption) => {
        const start = Math.floor(caption.startTime);
        const end = Math.ceil(caption.endTime);
        for (let i = start; i <= end; i++) {
          capMap[i] = caption;
        }
      });
      setCaptionsMap(capMap);
    } catch (error) {
      setCaptions([]);
      setCurrentCaption("");
      console.log(error);
      alert("فایل زیر نویس مشکل دارد");
    }
  }, [srtText]);

  useEffect(() => {
    function handleTimeUpdate() {
      const currentTime = videoRef.current.currentTime;
      // const currentCaption = captions.find(
      //   (caption) =>
      //     currentTime >= caption.startTime && currentTime <= caption.endTime
      // );
      let left = 0;
      let right = captions.length - 1;
      let mid;

      while (left <= right) {
        mid = Math.floor((left + right) / 2);
        if (
          captions[mid].startTime <= currentTime &&
          captions[mid].endTime >= currentTime
        ) {
          setCurrentCaption(captions[mid]);
          return;
        } else if (captions[mid].startTime < currentTime) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      setCurrentCaption(currentCaption);
    }
    if (captions.length !== 0)
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoRef, captions]);

  return (
    currentCaption && (
      <div className={"caption"}>
        <h3 dangerouslySetInnerHTML={{ __html: currentCaption.text }} />
      </div>
    )
  );
};

export default SRTCaptionViewer;
