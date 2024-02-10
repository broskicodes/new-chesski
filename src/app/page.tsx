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
import { Puzzle, SkillLevel } from "@/utils/types";
import { useChess } from "@/providers/ChessProvider/context";
import { Chess } from "chess.js";
import { usePuzzle } from "@/providers/PuzzleProvider/context";
import { FunctionCall, Message, ToolCall } from "ai";
import { useStockfish } from "@/providers/StockfishProvider/context";

export default function Home() {
  const [sessison, setSession] = useState<User | null>(null);
  const [origin, setOrigin] = useState("");
  const [puzzleIds, setPuzzleIds] = useState<string[]>([]);
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);

  // const [isLoading, setIsLoading] = useState(false);

  // const [chesscom, setChesscom] = useState("");
  // const [lichess, setLichess] = useState("");

  const [gptProcessing, setGptProcessing] = useState(false);
  const [prevFen, setPrevFen] = useState("");
  const [lastMove, setLastMove] = useState("");

  const [chatDataIdx, setChatDataIdx] = useState<number>(0);

  const logRef = useRef<HTMLDivElement>(null);

  const { setPuzzle, clearPuzzle, puzzleComplete, puzzle, moveIdx } = usePuzzle();
  const { initEngine, startSearch } = useStockfish();
  const { turn, orientation, game } = useChess();
  const { messages, append,  input, handleInputChange, handleSubmit, isLoading: chatLoading, setMessages, data: chatData } = useChat({
    api: "/chat/coach",
    body: {
      // lastMove: puzzle?.moves[moveIdx - 1],
      // puzzle

    },
    experimental_onToolCall: async (msgs: Message[], toolCalls: ToolCall[]) => {
      return {
        messages: msgs,
        toolCalls: toolCalls
      }
    },
    onFinish: (msg: Message) => {
      // console.log("finished", chatData);
      // if (chatData) {
      //   // @ts-ignore
      //   setPuzzleIds(chatData[0]!["puzzles"].map((p) => p.id));
      // }
      setGptProcessing(false);
    }
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

  useEffect(() => {
    let gonnaProcess = false;

    if (game.fen() !== prevFen) {
      const moves = game.history();
      const fen = game.fen();

      gonnaProcess = true;
      setGptProcessing(true);
      setPrevFen(fen);
      append({
        role: "assistant",
        content: `The user is playing as ${orientation}. The current position is ${fen}. The moves leading up to this position are ${moves.join(" ")}. ${turn === "white" ? "Black" : "White"} just played ${moves.at(-1)}.`
      });
    }

    if (turn !== orientation && !gptProcessing && !gonnaProcess) {
      startSearch();
    }
  }, [game, prevFen, orientation, turn, gptProcessing, startSearch, append]);

  useEffect(() => {
    if (turn !== orientation) {
      startSearch();
    }
  }, [turn, orientation, startSearch]);

  useEffect(() => {
    // @ts-ignore
    if (chatData && chatData.length > 0 && chatData.at(chatDataIdx) && chatData.at(chatDataIdx)["puzzles"][0].id !== puzzleIds[0]) {
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
    if (sessison) {
      initEngine(SkillLevel.Beginner);
    }
  }, [sessison, initEngine]);

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
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messages]);

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
        <div className="sm:pt-20">
          <div className="header hidden sm:block">
            CHESSKI
          </div>
          {/* <div className="chat"> */}
            {/* {!accountsLinked && (
              <div>
                <p>You must link your chess accounts in order to interact with Chesski.</p>
                <p>Please update your <Link href={"/profile"} className="underline">profile</Link>.</p>
              </div>
            )} */}
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
            {/* <div className="chat-messages" ref={logRef}>
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
          <div className="relative"> */}
            {/* {!puzzle && (
              <div className="board-overlay">
                <p className="bg-black bg-opacity-50 rounded-sm">Use chat to find puzzles to practice</p>
              </div>
            )} */}
          <div className="page-content">
            <div>
              <Chessboard />
            </div>
            <div className="logs">
              <div className="log-content" ref={logRef}>
              {messages.filter((_, i) => i % 2 == 1).map((message, i) => {
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
            </div>
          </div>
        </div> 
      )}
      <Footer />
    </div>
  );
}
