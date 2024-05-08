import { useAuth } from "@/providers/AuthProvider/context";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UserDataContext, UserDataProviderContext } from "./context";
import { Experience, ONBOARDING_UPDATE_DATE, UserData } from "@/utils/types";
import { Onboarding } from "@/components/Onboarding";
import { usePathname } from "next/navigation";

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const [chesscom, setChesscom] = useState<string | null>(null);
  const [lichess, setLichess] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience>(Experience.Beginner);
  const [onboarded, setOnboarded] = useState(false);

  const [name, setName] = useState("");
  const [pfp, setPfp] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [subId, setSubId] = useState<string | null>(null);

  const [pageLoaded, setPageLoaded] = useState(false);

  const { session, sessionLoaded, supabase } = useAuth();
  const pathname = usePathname();

  const getData = useCallback(async () => {
    if (session && supabase) {
      setPfp(session.user_metadata.picture);
      setName(session.user_metadata.name);

      const { data } = await supabase
        .from("user_data")
        .select()
        .eq("uuid", session.id);

      if (data && data[0]) {
        setChesscom(data[0].chesscom_name);
        setLichess(data[0].lichess_name);
        setExperience(data[0].skill_level);
        setOnboarded(data[0].onboarded)
      } else {
        setChesscom("");
        setLichess("");
        setExperience(Experience.Beginner);
        setOnboarded(false)
      }
    } else {
      const item = localStorage.getItem("userData");

      if (item) {
        const userData: UserData = JSON.parse(item);

        setChesscom(userData.chesscom_name);
        setLichess(userData.lichess_name);
        setExperience(userData.skill_level);
        setOnboarded(userData.onboarded)
      } else {
        setChesscom("");
        setLichess("");
        setExperience(Experience.Beginner);
        setOnboarded(false);
        setName("");
        setPfp("");
        setIsPro(false);
        setSubId(null);
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
    getData()
      .then(() => {
        if (sessionLoaded)
          setPageLoaded(true);
      });
  }, [getData, sessionLoaded]);

  useEffect(() => {
    if (!session || !supabase) {
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from("pro_users")
        .select("active,sub_id")
        .eq("user_id", session.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error || !data) {
        setIsPro(false);
        return;
      }

      setIsPro(data[0].active);
      setSubId(data[0].sub_id);
    })();

    const sub = supabase
      .channel("pro_users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pro_users",
        },
        (payload) => {
          if (payload.eventType === "DELETE" && payload.old.sub_id === subId) {
            setIsPro(false);
            setSubId(null);
          }
          if (
            (payload.eventType === "INSERT" ||
              payload.eventType === "UPDATE") &&
            (payload.new.sub_id === subId || payload.new.user_id === session.id)
          ) {
            setIsPro(payload.new.active);
            setSubId(payload.new.sub_id);
          }
        },
      )
      .subscribe();

    return () => {
      sub.unsubscribe();
    };
  }, [session, supabase, subId]);

  // useEffect(() => {
  //   (async () => {
  //     if (session) {
  //       const { data: userData } = await supabase!
  //         .from("user_data")
  //         .select()
  //         .eq("uuid", session.id);

  //       if (
  //         (userData &&
  //           userData[0] &&
  //           new Date(userData[0].updated_at) < ONBOARDING_UPDATE_DATE) ||
  //         !userData ||
  //         !userData[0]
  //       ) {
  //         const item = localStorage.getItem("userData");

  //         if (item) {
  //           const userData = JSON.parse(item);

  //           (async () => {
  //             const { data } = await supabase!
  //               .from("user_data")
  //               .select()
  //               .eq("uuid", session.id);

  //             const prevData = data && data[0] ? data[0] : {};
  //             const { error, data: d } = await supabase!
  //               .from("user_data")
  //               .upsert({
  //                 uuid: session.id,
  //                 ...prevData,
  //                 ...userData,
  //                 updated_at: new Date(),
  //               })
  //               .select();

  //             if (!error) {
  //               localStorage.removeItem("userData");
  //             }
  //           })();
  //         }
  //       }

  //       if (
  //         userData &&
  //         userData[0] &&
  //         new Date(userData[0].updated_at) > ONBOARDING_UPDATE_DATE
  //       ) {
  //         localStorage.removeItem("userData");
  //       }
  //     }
  //   })();
  // }, [session, supabase]);

  const value: UserDataProviderContext = useMemo(
    () => ({
      chesscom,
      lichess,
      experience,
      name,
      pfp,
      isPro,
      subId,
      onboarded,
      saveData,
      getData,
      updateChesscom: setChesscom,
      updateLichess: setLichess,
      updateExperience: setExperience,
    }),
    [chesscom, lichess, experience, pfp, name, isPro, subId, onboarded, saveData, getData],
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
      <Onboarding show={pageLoaded && pathname !== "/subscribe" && !onboarded} />
    </UserDataContext.Provider>
  );
};
