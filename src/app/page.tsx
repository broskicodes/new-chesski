"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { User } from "@supabase/supabase-js";
import { useChat, experimental_useAssistant } from "ai/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import "./styles.css";
import { Footer } from "@/components/Footer";
import { Chessboard } from "@/components/Chessboard";
import { Puzzle } from "@/utils/types";
import { useChess } from "@/providers/ChessProvider/context";
import { Chess } from "chess.js";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { FunctionCall, Message, ToolCall } from "ai";

export default function Home() {
  const [sessison, setSession] = useState<User | null>(null);
  const [origin, setOrigin] = useState("");
  const [accountsLinked, setAccountsLinked] = useState(false);
  // const [gamesImported, setGamesImported] = useState(false);
  // const [playstyleAnalyzed, setPlaystyleAnalyzed] = useState(false);
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  const [chesscom, setChesscom] = useState("");
  const [lichess, setLichess] = useState("");

  const [chatDataIdx, setChatDataIdx] = useState<number>(0);

  const chatRef = useRef<HTMLDivElement>(null);

  const { setPuzzle, clearPuzzle, puzzleComplete, puzzle, moveIdx } = usePuzzle();
  const { messages, input, handleInputChange, handleSubmit, isLoading: chatLoading, setMessages, data: chatData } = useChat({
    api: "/chat",
    body: {
      lastMove: puzzle?.moves[moveIdx - 1],
      puzzle
    },
    experimental_onToolCall: async (msgs: Message[], toolCalls: ToolCall[]) => {
      // console.log("tool calls", toolCalls);
      return {
        messages: msgs,
        toolCalls: toolCalls
      }
    },
    // onFinish: (msg: Message) => {
    //   console.log("finished", chatData);
    //   if (chatData) {
    //     // @ts-ignore
    //     setPuzzleIds(chatData[0]!["puzzles"].map((p) => p.id));
    //   }
    // }
  });

  const supabase = useMemo(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }, []);

  const oauth = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }, [origin, supabase]);

  const setNextPuzzle = useCallback(async () => {
    await supabase
      .from("completed_puzzles")
      .insert({ user_id: sessison!.id, puzzle_id: puzzleIds[puzzleIdx] });

    setPuzzleIdx(puzzleIdx + 1);
  }, [supabase, sessison, puzzleIds, puzzleIdx]);

  // const importGames = useCallback(async () => {
  //   if (!sessison) return;
  //   setIsLoading(true);
    
  //   const res = await fetch("/import", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //   });

  //   if (!res.ok) {
  //     alert("Error importing games");
  //     setIsLoading(false);
  //     return;
  //   }

  //   const count = await res.json();
  //   if (count === 0) {
  //     alert("No games found. Ensure you have linked the correct accounts");
  //     setIsLoading(false);
  //     return;
  //   } else {
  //     setGamesImported(true);
  //     setIsLoading(false);
  //   }
  // }, [sessison]);

  // const analyzePlaystyle = useCallback(async () => {
  //   if (!sessison) return;
  //   setIsLoading(true);

  //   const res = await fetch("/analyze-user", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //   });

  //   if (!res.ok) {
  //     alert("Error analyzing playstyle");
  //     setIsLoading(false);
  //     return;
  //   }

  //   // const chatData = await res.json();

  //   // alert(`Your playstyle has been analyzed`);
  //   setMessages([
  //     { id: "0", role: "assistant", content: "I have analyzed your playstyle and weaknesses. What would you like to know?" }
  //   ]);
  //   setPlaystyleAnalyzed(true);
  //   setIsLoading(false);
  // }, [sessison, setMessages]);

  useEffect(() => {
    // @ts-ignore
    if (chatData && chatData.length > 0 && chatData.at(chatDataIdx) && chatData.at(chatDataIdx)["puzzles"][0].id !== puzzleIds[0]) {
      // @ts-ignore
      // console.log("chat data", chatData.at(chatDataIdx)["puzzles"].map((p) => p.content));
      // @ts-ignore
      setPuzzleIds(chatData.at(chatDataIdx)!["puzzles"].map((p) => p.id));
      setPuzzleIdx(0);
      setChatDataIdx(chatDataIdx + 1);
    }
  }, [chatData, puzzleIds, puzzleIdx, chatDataIdx]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setSession(user);
    })();
  }, [supabase]);

  useEffect(() => {
    if (!sessison) return;

    (async () => {
      if (!accountsLinked) {
        const { data } = await supabase.from('user_chess_accounts').select().eq('uuid', sessison.id);
        if (!data || data.length === 0) {
          return;
        }

        const { chesscom_name, lichess_name } = data[0];
        setChesscom(chesscom_name);
        setLichess(lichess_name);
      }
    })();
  }, [sessison, supabase, accountsLinked]);

  useEffect(() => {
    if (chesscom.length > 0 || lichess.length > 0) {
      setAccountsLinked(true);
    }
  }, [chesscom, lichess]);

  // useEffect(() => {
  //   if (!accountsLinked) return;

  //   (async () => {
  //     if (!gamesImported) {
  //       const { chatData: games } = await supabase
  //         .from('game_pgns')
  //         .select('*')
  //         .or(`white.in.(${chesscom}), black.in.(${chesscom}), white.in.(${lichess}), black.in.(${lichess})`)
  //         .limit(10);

  //       if (!games || games.length < 10) {
  //         // alert("No games imported. Please import games");
  //         return;
  //       }

  //       setGamesImported(true);
  //     }
  //   })();

  // }, [supabase, chesscom, lichess, accountsLinked, gamesImported]);

  // useEffect(() => {
  //   if (!gamesImported || !sessison) return;

  //   (async () => {
  //     if (!playstyleAnalyzed) {
  //       const { chatData } = await supabase
  //         .from("user_analysis")
  //         .select("*")
  //         .eq("uuid", sessison.id);

  //       if (!chatData || chatData.length === 0) {
  //         return;
  //       }

  //       setMessages([
  //         { id: "0", role: "assistant", content: "I have analyzed your playstyle and weaknesses. What would you like to know?" }
  //       ]);
  //       setPlaystyleAnalyzed(true);
  //     }
  //   })();
  // }, [supabase, sessison, gamesImported, playstyleAnalyzed, setMessages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (puzzleIds.length === 0)  {
      return;
    }

    if (puzzleIdx >= puzzleIds.length) {
      setPuzzleIdx(0);
      setPuzzleIds([]);
      clearPuzzle();
      return;
    }

    setPuzzle(puzzleIds[puzzleIdx]);
  }, [setPuzzle, clearPuzzle, puzzleIds, puzzleIdx]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { id: "0", role: "assistant", content: "Hi! I'm Chesski, your personal chess assistant. I'm here to help you practice puzzles. What topics would you like to study?" }
      ]);
    }
  }, [setMessages, messages]);

  return (
    <div className="h-full">
      {!sessison && (
        <div className="flex flex-col justify-center items-center h-full">
          <div className="header">
            CHESSKI
          </div>
          <div className="sub-header">
            <p>Your personal AI chess <i>tutor</i>&nbsp; that coaches you in <i>plain English</i></p>
          </div>
          <div className="sign-up">
            <button className="button" onClick={oauth}>Sign In With Google</button>
          </div>
        </div>
      )}
      {sessison && (
        <div className="pt-20">
          <div className="header">
            CHESSKI
          </div>
          <div className="chat">
            {!accountsLinked && (
              <div>
                <p>You must link your chess accounts in order to interact with Chesski.</p>
                <p>Please update your <Link href={"/profile"} className="underline">profile</Link>.</p>
              </div>
            )}
            {/* {accountsLinked && !gamesImported && (
              <button className={`button`} onClick={importGames} disabled={isLoading}>
                {!isLoading && "Import Games"}
                {isLoading && <div className="w-6 h-6 border-4 border-gray-200 border-t-[#1B03A3] rounded-full animate-spin" />}
              </button>
            )} */}
            {/* {gamesImported && !playstyleAnalyzed && (
              <button className={`button`} onClick={analyzePlaystyle} disabled={isLoading}>
                {!isLoading && "Analyze Playstyle"}
                {isLoading && <div className="w-6 h-6 border-4 border-gray-200 border-t-[#1B03A3] rounded-full animate-spin" />}
              </button>
            )} */}
            <div className="chat-messages" ref={chatRef}>
              {messages.map((message, i) => {
                if (!message.content) return null;

                if (!(message.role === "user" || message.role === "assistant")) return null;

                return (
                  <div key={i} className="flex flex-col">
                    <span className={`${message.role}-message role`}>{message.role.toUpperCase()}:</span>
                    <ReactMarkdown className="content">{message.content}</ReactMarkdown>
                  </div>
                )
              })}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-row items-center space-x-4 w-full">
              <input className="input" value={input} onChange={handleInputChange} placeholder="Send a message" />
              <button className="button" type="submit" disabled={chatLoading}>
                Send
              </button>
            </form>
          </div>
          <div className="relative">
            {!puzzle && (
              <div className="board-overlay">
                <p className="bg-black bg-opacity-50 rounded-sm">Use chat to find puzzles to practice</p>
              </div>
            )}
            <Chessboard />
          </div>
          {puzzleComplete && <button className="button" onClick={setNextPuzzle}>
            next
          </button>}
          {/* <button className="button" onClick={async () => {
             const res = await fetch("/api/puzzle/embed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });

          }}>
            embed
          </button> */}
          {/* <button className="button" onClick={async () => {
            const res = await fetch("/api/puzzle", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            })
          }}>
            puzzles
          </button> */}
        </div> 
      )}
      <Footer />
    </div>
  );
}
