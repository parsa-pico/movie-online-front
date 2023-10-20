import React, { useState, useEffect } from "react";
import { isEmptyObj } from "../Common/commonFuncs";

const SRTCaptionViewer = ({
  srtText,
  videoRef,
  subDelay,
  captionsMapState,
  currentCaptionState,
  currentTime,
}) => {
  const [captionsMap, setCaptionsMap] = captionsMapState;
  const [currentCaption, setCurrentCaption] = currentCaptionState;

  function handleCaption() {
    const captionToShow = captionsMap[Math.floor(currentTime)];
    console.log(Math.floor(currentTime));
    setCurrentCaption(captionToShow);
  }

  useEffect(() => {
    if (!isEmptyObj(captionsMap)) handleCaption();
  }, [captionsMap, currentTime]);

  useEffect(() => {
    if (subDelay === 0 || isEmptyObj(captionsMap)) return;

    const capMap = {};
    for (let key in captionsMap) {
      const { startTime, endTime, text } = captionsMap[key];
      capMap[key] = {
        startTime: startTime + subDelay,
        endTime: endTime + subDelay,
        text,
      };
    }
    // console.log(capMap[1]);
    setCaptionsMap(capMap);
  }, [subDelay]);
  useEffect(() => {
    const parseSRT = (srtText) => {
      const captionBlocks = srtText.split("\r\n\r\n");

      const parsedCaptions = captionBlocks.map((block) => {
        try {
          const [_, time, ...textLines] = block.split("\r\n").filter(Boolean);

          let [startTime, endTime] = time.split(" --> ").map(parseTime);
          startTime = Math.floor(startTime);
          endTime = Math.ceil(endTime);
          const text = textLines.join("<br/>");
          return { startTime, endTime, text };
        } catch (error) {
          console.log(error);
          return { startTime: null, endTime: null, text: "" };
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

      const capMap = {};
      captionsData.forEach((caption) => {
        const start = Math.floor(caption.startTime);
        const end = Math.ceil(caption.endTime);
        if (start && end) {
          for (let i = start; i <= end; i++) {
            capMap[i] = caption;
          }
        }
      });

      setCaptionsMap(capMap);
    } catch (error) {
      setCaptionsMap({});
      setCurrentCaption("");
      console.log(error);
      alert("فایل زیر نویس مشکل دارد");
    }
  }, [srtText]);

  // useEffect(() => {
  //   if (Object.keys(captionsMap).length != 0)
  //     videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
  //   return () => {
  //     videoRef.current.removeEventListener("timeupdate", handleTimeUpdate);
  //   };
  // }, [videoRef, captionsMap]);

  return (
    currentCaption && (
      <div className={"caption"}>
        <h3 dangerouslySetInnerHTML={{ __html: currentCaption.text }} />
      </div>
    )
  );
};

export default SRTCaptionViewer;
