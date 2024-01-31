"use client";

import { useCallback, useEffect, useState } from "react";
import "./styles.css";

export default function Profile() {
  const [chesscom, setChesscom] = useState("");
  const [lichess, setLichess] = useState("");
  const [saved, setSaved] = useState(false);

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

    setSaved(true);
    
  }, [chesscom, lichess]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/profile/save");
      const data = await res.json();

      console.log(data);
      setChesscom(data.chesscom_name);
      setLichess(data.lichess_name);
    })();
  }, []);

  return (
    <div className="profile-content flex flex-col">
      <div className="header">
        PROFILE
      </div>
      <div className="bg-black w-full h-[1px] my-2" />
      <div className="sub-header">
        Link your chess accounts
      </div>
      <div className="flex flex-col space-y-6 sm:space-y-0 sm:flex-row sm:space-x-12 items-center mx-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row items-center space-x-2 justify-between">
            <p className="label">Chess.com</p>
            <input 
              className="input" 
              type="text" 
              value={chesscom} 
              placeholder="Chess.com Username" 
              onChange={({ target }) => {
                setSaved(false);
                setChesscom(target.value);
              }} />
          </div>
          <div className="flex flex-row items-center space-x-2 justify-between">
            <p className="label">Lichess</p>
            <input 
              className="input" 
              type="text" 
              value={lichess} 
              placeholder="Lichess Username"
              onChange={({ target }) => {
                setSaved(false);
                setLichess(target.value);
              }} />
          </div>
        </div>
        <button className="button" onClick={saveData} disabled={saved}>Save</button>
      </div>
      {saved && (
        <p className="success">Account changes saved!</p> 
      )}
    </div>
  );
}