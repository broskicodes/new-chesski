import { useAuth } from "@/providers/AuthProvider/context";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { UserDataContext, UserDataProviderContext } from "./context";
import { Experience } from "@/utils/types";

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const [chesscom, setChesscom] = useState<string | null>(null);
  const [lichess, setLichess] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience>(Experience.Beginner);

  const [name, setName] = useState("");
  const [pfp, setPfp] = useState("");

  const { session, supabase} = useAuth();

  const getData = useCallback(async () => {
    if (!session || !supabase) {
      return;
    }

    const { data } = await supabase.from('user_data').select().eq('uuid', session.id);

    if (data && data[0]) {
      setChesscom(data[0].chesscom_name);
      setLichess(data[0].lichess_name);
      setExperience(data[0].skill_level);
    } else {
      setChesscom("");
      setLichess("");
      setExperience(Experience.Beginner);
    }

  }, [session, supabase]);

  const saveData = useCallback(async () => {
    const res = await fetch("/profile/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chesscom, lichess, experience }),
    });

    if (!res.ok) {
      alert("Error saving data");
      return;
    }    
  }, [chesscom, lichess, experience]);

  useEffect(() => {
    if (!session || !supabase) {
      setChesscom("");
      setLichess("");
      setExperience(Experience.Beginner);
      
      return;
    }

    // alert(JSON.stringify(session.user_metadata))
    setPfp(session.user_metadata.picture);
    setName(session.user_metadata.name);

    getData();
  }, [session, supabase, getData]);

  const value: UserDataProviderContext = useMemo(() => ({
    chesscom,
    lichess,
    experience,
    name,
    pfp,
    saveData,
    getData,
    updateChesscom: setChesscom,
    updateLichess: setLichess,
    updateExperience: setExperience
  }), [chesscom, lichess, experience, pfp, name, saveData, getData]);

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}