import React from "react";
import { Button } from "react-bootstrap";
import Switch from "react-switch";

export default function MovieFrom({
  defaultToast,
  chooseFromFile,
  setChooseFromFile,
  setVideoFile,
  link,
  setLink,
  submitMovieSrc,
  handleSrtChange,
  className,
}) {
  return (
    <div className={"video-configs " + className}>
      <div>
        <Button
          onClick={() => {
            const url = window.location.origin + window.location.pathname;
            navigator.clipboard.writeText(url);
            defaultToast("لینک کپی شد");
          }}
        >
          کپی لینک اتاق
        </Button>
        <div>
          <small>این لینک را به دوستان خود بدهید</small>
        </div>
      </div>

      <div className="load-from-wrapper mt-5">
        <h5>بارگذاری فیلم </h5>
        <div className="flex-row">
          <p>از فایل</p>
          <Switch
            offColor="#0d6efd"
            onColor="#0d6efd"
            uncheckedIcon={false}
            checkedIcon={false}
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
    </div>
  );
}
