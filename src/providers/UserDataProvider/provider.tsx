import { useAuth } from "@/providers/AuthProvider/context";
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from "react";
import { UserDataContext, UserDataProviderContext } from "./context";
import { Experience, ONBOARDING_UPDATE_DATE, UserData } from "@/utils/types";

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const [chesscom, setChesscom] = useState<string | null>(null);
  const [lichess, setLichess] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience>(Experience.Beginner);

  const [name, setName] = useState("");
  const [pfp, setPfp] = useState("");

  const { session, supabase} = useAuth();

  const getData = useCallback(async () => {
    if (session && supabase){

      setPfp(session.user_metadata.picture);
      setName(session.user_metadata.name);

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
    } else {
      const item = localStorage.getItem('userData');

      if (item) {
        const userData: UserData = JSON.parse(item);

        setChesscom(userData.chesscom_name);
        setLichess(userData.lichess_name);
        setExperience(userData.skill_level);
      } else {
        setChesscom("");
        setLichess("");
        setExperience(Experience.Beginner);
      }
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
    getData();
  }, [getData]);

  useEffect(() => {
    (async () => {
      if (session) {
        const { data: userData } = await supabase!.from('user_data')
          .select()
          .eq("uuid", session.id);

        if (
          (userData && userData[0] && new Date(userData[0].updated_at) < ONBOARDING_UPDATE_DATE)
          || !userData
          || !userData[0]
        ) {
          const item = localStorage.getItem('userData');

          if (item) {
            const userData = JSON.parse(item);

            (async () => {
              const { data } = await supabase!.from('user_data')
                .select()
                .eq("uuid", session.id);

              const prevData = data && data[0] ? data[0] : {}
              const { error, data: d } = await supabase!.from("user_data")
                .upsert({
                  uuid: session.id,
                  ...prevData,
                  ...userData,
                  updated_at: new Date()
                })
                .select();
                
              if (!error) {
                localStorage.removeItem("userData")
              }
            })();
          }
        }

        if (userData && userData[0] && new Date(userData[0].updated_at) > ONBOARDING_UPDATE_DATE) {
          localStorage.removeItem("userData");
        }
      } 
    })();
  }, [session, supabase]);

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