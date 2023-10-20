import React from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Room() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        nav(`/${roomId}`, { state: { name } });
      }}
      id="room-page"
    >
      <h2> ورود به اتاق</h2>
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
      <Button type="submit" className="w-100 mt-2">
        ورود
      </Button>
    </form>
  );
}
