import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Room() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [shouldSave, setShouldSave] = useState(false);
  useEffect(() => {
    setName(localStorage.getItem("name") || "");
    setRoomId(localStorage.getItem("roomId") || "");
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (shouldSave) {
          localStorage.setItem("name", name);
          localStorage.setItem("roomId", roomId);
        }
        nav(`/${roomId}`, { state: { name } });
      }}
      id="room-page"
    >
      <h2 className="mb-5"> ورود به اتاق</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-control w-100 mb-2"
        placeholder="نام کاربری دلخواه"
        dir="rtl"
      />
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="form-control w-100"
        placeholder="نام اتاق"
        dir="rtl"
      />
      <div className="room-check-wrapper ">
        <label htmlFor="room-checkbox">به خاطر بسپار</label>
        <input
          checked={shouldSave}
          onChange={(e) => {
            setShouldSave(e.target.checked);
          }}
          id="room-checkbox"
          type="checkbox"
          className=""
        />
      </div>
      <div className="text-danger room-description mt-1 mb-3">
        <small>
          قبل از ورود به اتاق از تنظیم بودن ساعت دستگاه خود مطمئن شوید
        </small>
      </div>
      <Button type="submit" className="w-100 mt-2">
        ورود
      </Button>
    </form>
  );
}
