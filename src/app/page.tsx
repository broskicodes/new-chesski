"use client";

import { FormEventHandler, use, useCallback, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [validSignup, setValidSignup] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const submit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      alert("Error signing up");
      return;
    }

    setValidSignup(true);
  }, [email]);

  return (
    <div>
      <div className="header">
        CHESSKI
      </div>
      <div className="sub-header">
        <p>Your personal AI chess <i>tutor</i>&nbsp; that coaches you in <i>plain English</i></p>
      </div>
      {validSignup && (
        <div className="success flex flex-col items-center">
          <p>Thank you for signing up!</p>
          <p>We&apos;ll be in touch soon.</p>
        </div>
      )}
      {!validSignup && (<form className="sign-up" onSubmit={submit}>
        <div className="flex flex-col">
          <input
            id="email"
            value={email}
            type="text"
            placeholder="Email address"
            onChange={({ target }) => {
              setEmail(target.value);
              setIsValidEmail(true);
            }}
          />
          {!isValidEmail && <p className="error">Invalid email address</p>}
        </div>
        <button className="button" type="submit">
          Sign up
        </button>
      </form>)}
    </div>
  );
}
