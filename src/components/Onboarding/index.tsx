import "./styles.css";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faBell, faCheck, faCircleCheck, faStar, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { API_URL, CHESSKI_MONTHLY_PRICE, CHESSKI_YEARLY_PRICE, ChessSite, Goal, SubType, UserData } from "@/utils/types";
import { useAuth } from "@/providers/AuthProvider/context";
import Image from "next/image";
import posthog from "posthog-js";
import { useUserData } from "@/providers/UserDataProvider/context";
import { useToast } from "../ui/use-toast";

interface Props {
  show?: boolean
}

export const Onboarding = ({ show }: Props) => {
  const [step, setStep] = useState(0);
  const [chesssite, setChessSite] = useState<ChessSite | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [username, setUsername] = useState("");
  const [usernameInvalid, setUsenamInvalid] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { signInWithOAuth, session, supabase } = useAuth();
  const { isPro } = useUserData();
  const path = usePathname();
  const maxSteps = useMemo(() =>  path === "/puzzles" || isPro ? 3 : 4, [isPro, path]);

  const router = useRouter();

  const tier = useMemo(() => ({
    title: "Trial",
    description: "Understand your free trial",
    price: CHESSKI_MONTHLY_PRICE,
    steps: [
      { 
        h: "Sign up",
        sh: "Your profile has been created!",
        i: faCheck,
        d: true
      },
      { 
        h: "Today: Get Instant Access",
        sh: "Custom chess insights and explanations generated just for you.",
        i: faUnlock
      },
      {
        h: "In 2 days: Trial Reminder",
        sh: "Get an email reminder about when your trials ends. Cancel any time.",
        i: faBell
      },
      {
        h: "In 3 days: Trial Ends",
        sh: `Your first payment will be collected on ${new Date(new Date().setDate(new Date().getDate() + 3)).toDateString()}.`,
        i: faStar
      }
    ],
    cta: "Start my 3-day trial"
  }), []);

  const finishOnboarding = useCallback(
    async () => {
      posthog.capture("onboarding_finished")
      const userData: UserData = {
        learning_goal: goal!,
        chessSite: chesssite!,
        onboarded: true
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      if (session && supabase) {
        const { data, error } = await supabase.from("user_data")
          .upsert({
            onboarded: true,
            chessSite: chesssite,
            uuid: session.id,
          })
          .select();

        console.log(data, error);
      }

      // signUp && !session ? signInWithOAuth() : router.push("/play");
    },
    [chesssite, goal,, session, supabase],
  );

    useEffect(() => {
      if (session)
        setStep(1);
      else
        setStep(0)
    }, [session])

  return (
    <Sheet open={show && !done && false} >
      {/* <SheetTrigger>
        hey
      </SheetTrigger> */}
      <SheetContent side="bottom" allowClose={false} className="">
        {step === 0 && (
          <div className="flex flex-col h-[480px] sm:max-w-2xl sm:mx-auto ">
            <SheetHeader className="flex flex-row items-center justify-center">
              <Image width={48} height={48} src={"/chesski-logo.svg"} alt="" />
              <span className="arvo text-2xl font-bold">CHESSKI</span>
            </SheetHeader>
            <div className="w-full h-full flex flex-col relative mt-32 justify-between">
              <div className="flex flex-col space-y-4 items-center text-center">
                <SheetTitle className="text-3xl sm:text-4xl font-m font-semibold"><span className="font-extrabold text-[#1b03a3]">Win more</span> chess games.</SheetTitle>
                <SheetDescription className="text-lg font-m">
                  Chesski helps you <span className="font-semibold">train faster</span> so you can <span className="font-semibold">win more.</span>
                </SheetDescription>
              </div>
              <Button
                className="w-full font-bold text-lg "
                onClick={() =>
                  signInWithOAuth(
                    `${window.location.pathname.slice(1)}${window.location.search}`,
                  )
                  // setStep(step + 1)
                }
              >
                Sign in with Google
              </Button>
            </div>
            <SheetFooter>
              <div className="flex flex-col sm:space-y-6 mt-6">
                <div className="flex flex-row items-center">
                  <Progress
                    className="w-full"
                    value={(step / maxSteps) * 100}
                  />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col h-[480px] sm:max-w-2xl sm:mx-auto">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>{"Where do you usually play chess?"}</SheetTitle>
                <SheetDescription>Where have you played your most recent games?</SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col h-full space-y-6 justify-center py-4 w-full max-w-2xl ">
              <ul className="flex flex-col space-y-2 w-full">
                <li onClick={() => setChessSite(ChessSite.Chesscom)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${chesssite === ChessSite.Chesscom ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="py-2 font-bold">Chess.com</span>
                </li>
                <li onClick={() => setChessSite(ChessSite.Lichess)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${chesssite === ChessSite.Lichess ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="py-2 font-bold">Lichess</span>
                </li>
                {/* <li onClick={() => setChessSite(ChessSite.None)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${chesssite === ChessSite.None ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="py-2 font-bold">800 - 1000</span>
                </li> */}
                <li 
                // onClick={() => setChessSite(ChessSite.InPerson)} 
                className={`flex flex-row items-center py-1 px-2 rounded-md w-full bg-gray-200/50 relative ${chesssite === ChessSite.InPerson ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="py-2 font-bold text-black/50">In person (Coming Soon)</span>
                  <div className="absolute inset-0 bg-black/10 rounded-md"></div>
                </li>
                <li 
                // onClick={() => setChessSite(ChessSite.Other)} 
                className={`flex flex-row items-center py-1 px-2 rounded-md w-full bg-gray-200/50 relative ${chesssite === ChessSite.Other ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="py-2 font-bold text-black/50">Other (Coming Soon)</span>
                  <div className="absolute inset-0 bg-black/10 rounded-md"></div>
                </li>
              </ul>
            </div>
            <SheetFooter>
              <div className="flex flex-col w-full">
                <Button className="w-full sm:w-96 sm:mx-auto" onClick={() => setStep(step + 1)} disabled={chesssite === null}>Continue</Button>
                <div className="flex flex-row items-center mt-4">
                  {/* <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button> */}
                  <Progress  className="w-full" value={step / maxSteps * 100} />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col h-[480px] sm:max-w-2xl sm:mx-auto">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>{chesssite === ChessSite.Chesscom || chesssite === ChessSite.Lichess ? `Enter your username for ${chesssite}` : "Please upload a PGN with your recent games"}</SheetTitle>
                <SheetDescription>
                  We will use your game history to personalize your experience
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col h-full justify-center py-4 w-full max-w-2xl ">
              {(chesssite === ChessSite.Chesscom || chesssite === ChessSite.Lichess) && (
                <div className="h-2/6 flex flex-col w-full items-center justify-center space-y-4">
                  <div className="w-full">
                    <Input disabled={loading || summary.length > 0} className={`${usernameInvalid ? "ring ring-2 ring-red-600" : ""}`} value={username} onChange={({ target }) => { setUsername(target.value); setUsenamInvalid(false); } } placeholder={`${chesssite} username`} />
                    {usernameInvalid && <span className="text-red-600">Invalid Username</span>}
                  </div>
                  <Button className="w-full sm:w-96" disabled={username.length < 1 || loading || summary.length > 0} onClick={async () => {
                    setLoading(true);
                    setUsenamInvalid(false);
                    const res = await fetch(`${API_URL}/user/analyze`, { 
                      method: "POST",
                      credentials: "include",
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(
                        chesssite === ChessSite.Lichess 
                          ? { lichess_name: username.trim() } 
                          : { chesscom_name: username.trim() }
                      )
                    });
                    setLoading(false)

                    if (!res.ok) {
                      setUsenamInvalid(true);
                    } else {
                      setSummary(await res.text());
                    }
                    // console.log(await res.text())
                  }}>Confirm</Button>
                </div>
              )}
              <div className="h-1/6 flex items-center">
                {loading && (
                    <div className="flex flex-row space-x-2 items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1B03A3]" />
                      <span>Analysing your recent games</span>
                    </div>
                  )}
                  {summary.length > 0 && <span className="font-bold text-lg sm:text-xl">Your profile has been updated!</span>}
              </div>
              <div className="h-3/6 flex flex-col space-y-2">
                <div className="font-bold text-lg sm:text-xl">Generated Insights:</div>
                {summary.length > 0 && (
                  <div>
                    <div className="text-sm sm:text-normal">{summary}</div>
                  </div>
                )}
              </div>
            </div>
            <SheetFooter>
              <div className="flex flex-col w-full">
                {summary.length > 0 && (
                  <Button className="w-full sm:w-96 sm:mx-auto" disabled={summary.length < 1} onClick={() => setStep(step + 1)}>
                    {"Continue"}
                  </Button>
                )}
                {username.length === 0 && summary.length === 0 && (
                  <Button className="w-full sm:w-96 sm:mx-auto" disabled={summary.length < 1} onClick={() => setStep(step + 1)}>
                    {"Skip"}
                  </Button>
                )}
                <div className="flex flex-row items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <Progress
                    className="w-full"
                    value={(step / maxSteps) * 100}
                  />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col h-[480px] sm:max-w-2xl sm:mx-auto">
            {/* <SheetHeader className="flex flex-row items-center justify-center">
              <Image width={48} height={48} src={"/chesski-logo.svg"} alt="" />
              <span className="arvo text-2xl font-bold">CHESSKI</span>
            </SheetHeader> */}
            <div className="w-full h-full flex flex-col relative mt-20 justify-between">
              <div className="flex flex-col space-y-12 items-center text-center">
                <SheetTitle className="text-3xl sm:text-4xl font-bold">{"Chesski makes things simple"}</SheetTitle>
                <ul className="flex flex-col items-start text-left space-y-2 w-fit">
                  <li className="grid grid-cols-8 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-7">Let AI find your weaknesses</span>
                  </li>
                  <li className="grid grid-cols-8 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-7">Practice with custom training</span>
                  </li>
                  <li className="grid grid-cols-8 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-7">Win more games</span>
                  </li>
                </ul>
                {/* <SheetDescription className="text-lg">
                  Finding and training your mistakes <span className="font-semibold">train faster</span> so you can <span className="font-semibold">win more</span>
                </SheetDescription> */}
              </div>
            </div>
            <SheetFooter>
              <div className="flex flex-col w-full">
                <Button className="w-full sm:w-96 sm:mx-auto" onClick={async () => { setStep(step + 1); if (isPro) { await finishOnboarding(); setDone(true); } }}>Continue</Button>
                <div className="flex flex-row items-center">
                  <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                  <Progress  className="w-full" value={step / maxSteps * 100} />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {!isPro && step === 4 && (
          <div className="flex flex-col h-[480px] sm:max-w-2xl sm:mx-auto">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>Start your free trial</SheetTitle>
                <SheetDescription>
                 Experience all Chessi has to offer. Risk free! Cancel anytime.
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col space-y-8 justify-center items-center py-2 sm:px-0 mx-auto max-w-2xl h-full">
              <div key={tier.title} className="flex flex-col items-center">
                <ul role="list" className="mb-4 space-y-2 text-sm w-full sm:w-96 sm:px-0">
                  {tier.steps.map((step) => (
                    <li key={step.h} className="grid grid-cols-12 gap-x-4 items-center">
                      <div className={`place-self-center rounded-full py-1 px-1.5 shadow ${!step.d ? "bg-white" : "bg-[#1b03a3]/50"}`}>
                        <FontAwesomeIcon
                          icon={step.i}
                          size="lg"
                          className={`flex-shrink-0  ${step.d ? "text-white" : "text-[#1b03a3]"}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col ml-2 col-span-11">
                        <span className={`text-base font-bold text-[#1b03a3] ${step.d ? "opacity-70 line-through decoration-1" : ""}`}>{step.h}</span>
                        <span className="text-xs text-gray-500">{step.sh}</span>
                        </div>
                    </li>
                  ))}
                </ul>
                
              </div>
            </div>
            <SheetFooter>
              <div className="flex flex-col w-full">
                <div className="flex flex-col items-center font-m text-sm mb-2">
                  <div className="font-light">3-day free trial, then</div>
                  <div className="space-x-1">
                    <span className="font-semibold">${tier.price} /month</span>
                  </div>
                </div>
                {session && (
                  <Button
                    className="w-full sm:w-96 sm:mx-auto"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      await finishOnboarding();
                      posthog.capture("sub_clicked");
                      const re = await fetch(`${API_URL}/stripe/session/checkout`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          subType: SubType.Monthly,
                          // @ts-ignore
                          referral: window.tolt_referral,
                          trial: true
                        }),
                      });

                      const link = await re.text();

                      router.push(link);
                    }}
                  >
                    {!loading && <span className="font-bold text-lg">{tier.cta}</span>}
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1B03A3]" />}
                  </Button>
                )}
                <Button className="w-fit mx-auto" onClick={async () => { await finishOnboarding(); setDone(true); posthog.capture("trial_skipped") } } size="thin" variant="link">Skip</Button>
                <div className="flex flex-row items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setStep(step - 1)}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </Button>
                  <Progress
                    className="w-full"
                    value={(step / maxSteps) * 100}
                  />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
