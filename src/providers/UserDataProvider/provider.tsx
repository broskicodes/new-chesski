import { useAuth } from "@/providers/AuthProvider/context";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { UserDataContext, UserDataProviderContext } from "./context";
import { API_URL, Experience, ONBOARDING_UPDATE_DATE, UserData } from "@/utils/types";
import { Onboarding } from "@/components/Onboarding";
import { usePathname } from "next/navigation";
import { Cross2Icon } from "@radix-ui/react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

export const UserDataProvider = ({ children }: PropsWithChildren) => {
  const [chesscom, setChesscom] = useState<string | null>(null);
  const [lichess, setLichess] = useState<string | null>(null);
  const [experience, setExperience] = useState<Experience>(Experience.Beginner);
  const [onboarded, setOnboarded] = useState(false);

  const [name, setName] = useState("");
  const [pfp, setPfp] = useState("");
  const [isPro, setIsPro] = useState(false);
  const [subId, setSubId] = useState<string | null>(null);

  const [experienceText, setExperienceText] = useState("");
  const [goals, setGoals] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [playstyle, setPlaystyle] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [open, setOpen] = useState(true);

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

      const { data: profile } = await supabase
        .from("user_profiles")
        .select()
        .eq("user_id", session.id);
      
      if (profile && profile[0]) {
        setWeaknesses(profile[0].weaknesses);
        setPlaystyle(profile[0].playstyle);
        setExperienceText(profile[0].experience);
        setGoals(profile[0].goals);
        setHasProfile(true);
      }

    } else {
      const item = localStorage.getItem("userData");

      if (item) {
        const userData = JSON.parse(item);

        setChesscom(userData.chesscom_name ?? "");
        setLichess(userData.lichess_name ?? "");
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
    const res = await fetch(`${API_URL}/profile`, {
      method: "POST",
      credentials: "include",
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
          setDataLoaded(true);
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
      experienceText,
      playstyle,
      weaknesses,
      goals,
      hasProfile,
      saveData,
      getData,
      updateChesscom: setChesscom,
      updateLichess: setLichess,
    }),
    [chesscom, lichess, experience, pfp, name, isPro, subId, onboarded, experienceText, weaknesses, playstyle, goals, hasProfile, saveData, getData],
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
      {dataLoaded && !hasProfile && (
        <div className={`absolute top-0 sm:top-14 bg-white w-full py-2 px-4 rounded-md shadow flex-row z-50 space-x-4 ${open ? "flex" : "hidden"}`}>
          <FontAwesomeIcon className="mt-4 sm:mt-2" size="lg" icon={faComment} />
          <div>
            <div className="font-semibold">New Chat Feature!</div>
            <div className="text-sm">Chat with Chesski at any time by clicking the icon in the bottom right.</div>
          </div>
          <div className={`absolute top-2 right-2 w-fit cursor-pointer`} onClick={() => setOpen(false)}>
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </div>
        </div>
      )}
      <Onboarding show={dataLoaded && pathname !== "/subscribe" && !onboarded} />
    </UserDataContext.Provider>
  );
};
