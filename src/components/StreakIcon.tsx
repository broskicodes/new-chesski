import { useAuth } from "@/providers/AuthProvider/context"
import { faFire, faFireFlameCurved } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react";
import { Tooltip } from "./Tooltip";

export const StreakIcon = () => {
  const [streak, setStreak] = useState(0);

  const { session, supabase} = useAuth();

  useEffect(() => {
    if (!session || !supabase) {
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("streaks")
        .select("streak")
        .eq("uuid", session.id);

      if (data && data[0]) {
        setStreak(data[0].streak);
      } else {
        setStreak(0)
      }
    })();

    const upSub = supabase
      .channel("streaks")
      .on("postgres_changes", {
        event: 'UPDATE', 
        schema: 'public', 
        table: "streaks" 
      }, (payload) => {
        if (payload.new.uuid === session.id) {
          setStreak(payload.new.streak);
        }
      })
      .subscribe();

    const inSub = supabase
      .channel("streaks")
      .on("postgres_changes", {
        event: 'INSERT', 
        schema: 'public', 
        table: "streaks" 
      }, (payload) => {
        if (payload.new.uuid === session.id) {
          setStreak(payload.new.streak);
        }
      })
      .subscribe();

    return () => {
      upSub.unsubscribe();
      inSub.unsubscribe();
    }
  }, [session, supabase])

  return (
    <div>
      {session && (
        <Tooltip className="w-fit cursor-default" content={`${streak} day streak`}>
          <div className="flex flex-row items-center space-x-2">
            <FontAwesomeIcon className="text-xl" icon={faFireFlameCurved} size="xl" />
            <div className="text-xl">{streak}</div>
          </div>
        </Tooltip>
      )}
    </div>
  )
}