"use client";

import { use, useCallback, useState } from "react";
import "./styles.css";

export default function Profile() {
  const [chesscom, setChesscom] = useState("");
  const [lichess, setLichess] = useState("");

  const saveData = useCallback(async () => {
    const res = await fetch("/profile/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chesscom, lichess }),
    });

    if (!res.ok) {
      alert("Error saving data");
      return;
    }

    alert("Saved!");
  }, [chesscom, lichess]);

  return (
    <div className="profile-content flex flex-col">
      <div className="header">
        PROFILE
      </div>
      <div className="bg-black w-full h-[1px] my-2" />
      <div className="sub-header">
        Link your chess accounts
      </div>
      <div className="flex flex-row space-x-12 items-center mx-auto">
        <div className="flex flex-col space-y-4">
          <input 
            className="input" 
            type="text" 
            value={chesscom} 
            placeholder="Chess.com Username" 
            onChange={({ target }) => {
              setChesscom(target.value);
            }} />
          <input 
            className="input" 
            type="text" 
            value={lichess} 
            placeholder="Lichess Username"
            onChange={({ target }) => {
              setLichess(target.value);
            }} />
        </div>
        <button className="button" onClick={saveData}>Save</button>
      </div>
    </div>
  );
}