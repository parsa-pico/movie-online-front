import React from "react";
import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Room() {
  const nav = useNavigate();
  const [roomId, setRoomId] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        nav(`/${roomId}`);
      }}
      className="w-100 mt-5"
    >
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        className="form-control w-100"
        placeholder="نام اتاق"
      />
      <Button type="submit" className="w-100 mt-2">
        ورود
      </Button>
    </form>
  );
}
