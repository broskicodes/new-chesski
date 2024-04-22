import { useCallback, useState } from "react";
import "./styles.css";
import { Star } from "../Star";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider/context";

interface FeedbackProps {
  show: boolean;
  close: () => void;
}

export const Feedback = ({ show, close }: FeedbackProps) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);

  const { session, supabase } = useAuth();

  const submitRaing = useCallback(async () => {
    if (!supabase || rating === 0 || !rating) return;

    const { data, error } = await supabase
      .from("feedback")
      .upsert({ uuid: session?.id, rating: rating })
      .select();

    if (error) {
      console.error("Error submitting feedback", error);
    }

    if (data && data.length > 0) {
      setFeedbackId(data[0].id);
    }
  }, [rating, supabase, session]);

  return (
    <div id="feedback-modal" className={`relative ${!show && "invisible"}`}>
      <div className="absolute top-2 right-4 cursor-pointer" onClick={close}>
        &#10005;
      </div>
      {!feedbackId && (
        <div className="flex flex-col items-center">
          <h1>How would you rate Chesski?</h1>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} filled={i <= rating} onClick={() => setRating(i)} />
            ))}
          </div>
          <button className="button" onClick={submitRaing}>
            Submit
          </button>
        </div>
      )}
      {feedbackId && (
        <div className="flex flex-col items-center space-y-3">
          <h1>Thanks for rating Chesski!</h1>
          <div className="flex flex-col items-center">
            <h2>Anything else to say?</h2>
            <h2>
              Reach out:{" "}
              <Link
                href={"mailto:braeden@chesski.lol"}
                className="underline semi-bold"
              >
                braeden@chesski.lol
              </Link>
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};
