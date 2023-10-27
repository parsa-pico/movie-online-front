import React from "react";

export default function Users({ currentUsers }) {
  return (
    <div className="users">
      <h2>کاربران</h2>
      <hr />
      <ul>
        {currentUsers.map((user, idx) => {
          return <li key={idx}>{user}</li>;
        })}
      </ul>
    </div>
  );
}
