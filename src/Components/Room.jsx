import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/socket";
import jwtDecode from "jwt-decode";

export default function Room() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [shouldSave, setShouldSave] = useState(false);
  const { socket, connectSocket } = useSocket();
  useEffect(() => {
    async function run() {
      setName(localStorage.getItem("name") || "");
      if (socket.disconnected) await connectSocket();
    }
    run();
  }, []);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (shouldSave) {
          localStorage.setItem("name", name);
        }
        socket.emit("createRoom", (id) => {
          window.location = `/${id}?name=${name}`;
        });
      }}
      id="room-page"
    >
      <h2 className="mb-5"> ساخت اتاق جدید </h2>
      <label style={{ alignSelf: "flex-end" }} htmlFor="userName">
        نام كاربري(فارسي)
      </label>
      <input
        required
        id="userName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-control w-100 mb-2"
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
        ساخت اتاق
      </Button>
    </form>
  );
}
