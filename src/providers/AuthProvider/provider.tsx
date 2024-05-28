import { createBrowserClient } from "@supabase/ssr";
import { User } from "@supabase/supabase-js";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AuthContext } from "./context";
import posthog from "posthog-js";
import { setCurrGameState } from "@/utils/clientHelpers";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBell,
  faCheck,
  faMagnifyingGlassChart,
  faRobot,
  faStar,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { usePathname, useRouter } from "next/navigation";
import { Onboarding } from "@/components/Onboarding";
import { API_URL } from "@/utils/types";
import { setCookie, getCookie, getCookies } from "cookies-next"

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [origin, setOrigin] = useState("");
  const [session, setSession] = useState<User | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const router = useRouter()
  // const pathname = usePathname();

  const supabase = useMemo(() => {
    // console.log(Cookie.)
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }, []);

  const signInWithOAuth = useCallback(
    async (next?: string) => {
      const { data: { url } } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${API_URL}/auth/callback${next ? `?next=${next}` : ""}`,
          skipBrowserRedirect: true
        },
      });

      const codeVer = getCookie("sb-mhhaxafdtiqyzugcasss-auth-token-code-verifier");
      setCookie("sb-mhhaxafdtiqyzugcasss-auth-token-code-verifier", codeVer, { domain: `.${process.env.NEXT_PUBLIC_ENV_DOMAIN}`})
      
      console.log(url);
      console.log(getCookie("sb-mhhaxafdtiqyzugcasss-auth-token-code-verifier"))
      console.log(getCookies())
      router.push(url!);
    },
    [origin, supabase],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("userData");
    setSession(null);
    setCurrGameState({
      id: "",
      startingPos: "",
      complete: false,
      moves: [],
      orientation: "white",
    });
  }, [supabase]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSession(user || null);
      setSessionLoaded(true);

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session?.user || null);
        },
      );

      return () => {
        listener.subscription.unsubscribe();
      };
    })();
  }, [supabase.auth]);

  useEffect(() => {
    console.log(session);
    if (session) {
      try {
        posthog.identify(session.id, {
          id: session.id,
          email: session.email,
        });

        // @ts-ignore
        if (window.tolt_referral) {
          // @ts-ignore
          window.tolt.signup(session.email);
        }
      } catch (error) {
        console.log("Error during posthog identify: ", error);
      }
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      supabase,
      sessionLoaded,
      signInWithOAuth,
      signOut,
    }),
    [session, supabase, sessionLoaded, signInWithOAuth, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {/* <Dialog open={pathname !== "/subscribe" && !session}>
        <DialogContent allowClose={false}>
          <DialogTitle className="text-3xl">
            Train like a Grandmaster
          </DialogTitle>
          <div className="grid grid-cols-12 grid-rows-3 w-full items-center">
            <FontAwesomeIcon icon={faRobot} />
            <p className="col-span-11">Get personal coaching from AI</p>
            <FontAwesomeIcon icon={faMagnifyingGlassChart} />
            <p className="col-span-11">Analyze your games</p>
            <FontAwesomeIcon icon={faArrowTrendUp} />
            <p className="col-span-11">Improve your weaknesses</p>
          </div>
          <DialogFooter>
            <Button
              className="w-full font-bold text-lg"
              onClick={() =>
                signInWithOAuth(
                  `${window.location.pathname.slice(1)}${window.location.search}`,
                )
              }
            >
              Sign in with Google
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
      {children}
    </AuthContext.Provider>
  );
};
