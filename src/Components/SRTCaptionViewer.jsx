import React, { useState, useEffect } from "react";
import { isEmptyObj } from "../Common/commonFuncs";

const SRTCaptionViewer = ({ srtText, videoRef, subDelay, currentTime }) => {
  const [originalCaptions, setOriginalCaptions] = useState([]);
  const [captionsMap, setCaptionsMap] = useState([]);
  const [currentCaption, setCurrentCaption] = useState("");

  function handleCaption() {
    // Binary search to find the caption
    let left = 0;
    let right = captionsMap.length - 1;
    let mid;

    while (left <= right) {
      mid = Math.floor((left + right) / 2);
      if (
        captionsMap[mid].startTime <= currentTime &&
        captionsMap[mid].endTime >= currentTime
      ) {
        setCurrentCaption(captionsMap[mid]);
        console.log("found cap:", captionsMap[mid]);
        return;
      } else if (captionsMap[mid].startTime < currentTime) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If no caption is found, set currentCaption to null
    setCurrentCaption("");
  }

  useEffect(() => {
    if (captionsMap.length !== 0) handleCaption();
  }, [captionsMap, currentTime]);

  useEffect(() => {
    try {
      if (captionsMap.length === 0) return;

      const capMap = [];
      for (let index in originalCaptions) {
        const { startTime, endTime, text } = originalCaptions[index];
        if (startTime && endTime)
          capMap.push({
            startTime: startTime - subDelay,
            endTime: endTime - subDelay,
            text,
          });
      }
      console.log(capMap[0]);
      setCaptionsMap(capMap);
    } catch (error) {
      console.log(error);
    }
  }, [subDelay]);
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
  useEffect(() => {
    if (!srtText) return;
    try {
      const captionsData = parseSRT(srtText);
      setOriginalCaptions(captionsData);
      setCaptionsMap(captionsData);
    } catch (error) {
      setCaptionsMap([]);
      setOriginalCaptions([]);
      setCurrentCaption("");
      console.log(error);
      alert("فایل زیر نویس مشکل دارد");
    }
  }, [srtText]);

  return (
    currentCaption && (
      <div className={"caption"}>
        <h3 dangerouslySetInnerHTML={{ __html: currentCaption.text }} />
      </div>
    )
  );
};

export default SRTCaptionViewer;
