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

  const { socket, connectSocket } = useSocket();
  useEffect(() => {
    async function run() {
      setName(localStorage.getItem("name") || "");
      if (socket.disconnected) await connectSocket();
    }
    run();
  }, []);

  return (
    <div id="room-page">
      <h2 className="mb-5"> ساخت اتاق جدید </h2>
      <div
        dir="rtl"
        className="row"
        style={{ alignItems: "center", alignSelf: "flex-end", width: "100%" }}
      >
        <div className="col">
          <label style={{ alignSelf: "flex-end" }} htmlFor="userName">
            نام كاربري(فارسي)
          </label>
          <input
            id="userName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control w-100 mb-2"
            dir="rtl"
          />
        </div>
        <div className="col">
          <Button
            className=""
            onClick={() => {
              localStorage.setItem("name", name);
              alert("نام شما عوض شد");
            }}
          >
            تغییر اسم
          </Button>
        </div>
      </div>
      <div className="text-danger  room-description mt-1 mb-3">
        <ol className="room-warnings">
          <li>قبل از ورود به اتاق از تنظیم بودن ساعت دستگاه خود مطمئن شوید</li>
          <li>از آخرین نسخه کروم استفاده کنید</li>
          <li>اگر از برنامه ویس کال استفاده میکنید،از دیسکورد استفاده کنید</li>
        </ol>
      </div>
      <Button
        onClick={() => {
          socket.emit("createRoom", (id) => {
            window.location = `/${id}`;
          });
        }}
        type="submit"
        className="w-100 mt-2"
      >
        ساخت اتاق
      </Button>
    </div>
  );
}
