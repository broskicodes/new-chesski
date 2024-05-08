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
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { CHESSKI_YEARLY_PRICE, Experience, Goal, SubType, UserData } from "@/utils/types";
import { useAuth } from "@/providers/AuthProvider/context";
import Image from "next/image";
import posthog from "posthog-js";
import { useUserData } from "@/providers/UserDataProvider/context";

interface Props {
  currStep?: number,
  show?: boolean
}

export const Onboarding = ({ currStep, show }: Props) => {
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [chesscom, setChesscom] = useState("");
  const [lichess, setLichess] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const { signInWithOAuth, session, supabase } = useAuth();
  const { isPro } = useUserData();
  const maxSteps = useMemo(() => isPro ? 3 : 4, []);

  const router = useRouter();

  const tier = useMemo(() => ({
    title: "Trial",
    description: "Understand your free trial",
    price: Math.round(CHESSKI_YEARLY_PRICE / 12 * 100) / 100,
    steps: [
      { 
        h: "Sign up",
        sh: "You succefully created your account!",
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
    cta: "Start 3-day trial"
  }), []);

  const finishOnboarding = useCallback(
    async () => {
      const userData: UserData = {
        chesscom_name: chesscom,
        lichess_name: lichess,
        learning_goal: goal!,
        skill_level: experience!,
        onboarded: true
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      if (session && supabase) {
        const { data, error } = await supabase.from("user_data")
          .upsert({
            ...userData,
            uuid: session.id,
          })
          .select();

        console.log(data, error);
      }

      // signUp && !session ? signInWithOAuth() : router.push("/play");
    },
    [experience, goal, chesscom, lichess, router, session, supabase,, signInWithOAuth],
  );

    useEffect(() => {
      if (currStep)
        setStep(currStep);
    }, [currStep])

  return (
    <Sheet open={show && !done} >
      {/* <SheetTrigger>
        hey
      </SheetTrigger> */}
      <SheetContent side="bottom" allowClose={false}>
        {step === 0 && (
          <div className="flex flex-col h-[480px]">
            <SheetHeader className="flex flex-row items-center justify-center">
              <Image width={48} height={48} src={"/chesski-logo.svg"} alt="" />
              <span className="arvo text-2xl font-bold">CHESSKI</span>
            </SheetHeader>
            <div className="w-full h-full flex flex-col relative mt-24 justify-between">
              <div className="flex flex-col space-y-4 items-center text-center">
                <SheetTitle className="text-3xl font-semibold"><span className="font-extrabold text-[#1b03a3]">Win more</span> chess games.</SheetTitle>
                <SheetDescription className="text-lg">
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
          <div className="flex flex-col h-[480px]">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>{"What's your chess rating?"}</SheetTitle>
                <SheetDescription>Your elo. Either online or official.</SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col h-full space-y-6 justify-center py-4 w-full max-w-2xl ">
              <ul className="flex flex-col space-y-2 w-full">
                <li onClick={() => setExperience(Experience.None)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.None ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/pdt.svg"} />
                  </div>
                  <span className="font-bold">Unrated</span>
                </li>
                <li onClick={() => setExperience(Experience.Beginner)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.Beginner ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/ndt.svg"} />
                  </div>
                  <span className="font-bold">{"< 1000"}</span>
                </li>
                {/* <li onClick={() => setExperience(Experience.None)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.None ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/kdt.svg"} />
                  </div>
                  <span className="font-bold">800 - 1000</span>
                </li> */}
                <li onClick={() => setExperience(Experience.Intermediate)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.Intermediate ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/bdt.svg"} />
                  </div>
                  <span className="font-bold">1000 - 1500</span>
                </li>
                <li onClick={() => setExperience(Experience.Advanced)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.Advanced ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/rdt.svg"} />
                  </div>
                  <span className="font-bold">1500 - 2000</span>
                </li>
                <li onClick={() => setExperience(Experience.Expert)} className={`cursor-pointer flex flex-row space-x-2 items-center py-1 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${experience === Experience.Expert ? "border border-[#1b03a3] border-1" : "" }`}>
                  <div className="p-1 bg-white rounded-full">
                    <Image height={32} width={32} alt="" src={"/pieces/qdt.svg"} />
                  </div>
                  <span className="font-bold">2000+</span>
                </li>
              </ul>
            </div>
            <SheetFooter>
              <div className="flex flex-col">
                <Button className="w-full" onClick={() => setStep(step + 1)} disabled={experience === null}>Continue</Button>
                <div className="flex flex-row items-center mt-4">
                  {/* <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button> */}
                  <Progress  className="w-full" value={step / maxSteps * 100} />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col h-[480px]">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>{"What are your goals?"}</SheetTitle>
                <SheetDescription>
                  How good do you want to get?
                </SheetDescription>
              </div>
            </SheetHeader>
            <div className="flex flex-col space-y-8 justify-center py-6 sm:px-0 w-full h-full">
              <ul className="flex flex-col space-y-2 w-full">
                <li onClick={() => setGoal(Goal.Casual)} className={`cursor-pointer py-2 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${goal === Goal.Casual ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="font-bold">Beat my friends</span>
                </li>
                <li onClick={() => setGoal(Goal.Competent)} className={`cursor-pointer py-2 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${goal === Goal.Competent ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="font-bold">1000 elo</span>
                </li>
                <li onClick={() => setGoal(Goal.Curious)} className={`cursor-pointer py-2 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${goal === Goal.Curious ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="font-bold">1500 elo</span>
                </li>
                <li onClick={() => setGoal(Goal.Commited)} className={`cursor-pointer py-2 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${goal === Goal.Commited ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="font-bold">2000 elo</span>
                </li>
                <li onClick={() => setGoal(Goal.Serious)} className={`cursor-pointer py-2 px-2 rounded-md w-full bg-gray-200/50 hover:bg-gray-200/75 ${goal === Goal.Serious ? "border border-[#1b03a3] border-1" : "" }`}>
                  <span className="font-bold">Become a titled player</span>
                </li>
              </ul>
            </div>
            <SheetFooter>
              <div className="flex flex-col">
                <Button className="w-full" disabled={goal === null} onClick={() => setStep(step + 1)}>
                  {"Continue"}
                </Button>
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
          <div className="flex flex-col h-[480px]">
            {/* <SheetHeader className="flex flex-row items-center justify-center">
              <Image width={48} height={48} src={"/chesski-logo.svg"} alt="" />
              <span className="arvo text-2xl font-bold">CHESSKI</span>
            </SheetHeader> */}
            <div className="w-full h-full flex flex-col relative mt-20 justify-between">
              <div className="flex flex-col space-y-8 items-center text-center">
                <SheetTitle className="text-2xl font-semibold">{"With Chesski, you'll reach your goals "}<span className="text-3xl font-extrabold text-[#1b03a3]">5x faster</span></SheetTitle>
                <ul className="flex flex-col items-start text-left space-y-2">
                  <li className="grid grid-cols-12 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-11">Easily find and train your weaknesses</span>
                  </li>
                  <li className="grid grid-cols-12 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-11">Improve the things that matter most at your skill level</span>
                  </li>
                  <li className="grid grid-cols-12 gap-x-4">
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      size="xl"
                      className={`place-self-center flex-shrink-0  text-[#1b03a3]/70`}
                      aria-hidden="true"
                    />
                    <span className="col-span-11">Learn new concepts as you need them</span>
                  </li>
                </ul>
                {/* <SheetDescription className="text-lg">
                  Finding and training your mistakes <span className="font-semibold">train faster</span> so you can <span className="font-semibold">win more</span>
                </SheetDescription> */}
              </div>
            </div>
            <SheetFooter>
              <div className="flex flex-col">
                <Button className="w-full" onClick={async () => { setStep(step + 1); if (isPro) { await finishOnboarding(); setDone(true); } }}>Continue</Button>
                <div className="flex flex-row items-center">
                  <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                  <Progress  className="w-full" value={step / maxSteps * 100} />
                </div>
              </div>
            </SheetFooter>
          </div>
        )}
        {!isPro && step === 4 && (
          <div className="flex flex-col h-[480px]">
            <SheetHeader>
              <div className="flex flex-col space-y-1">
                <SheetTitle>Learn how your free trial works</SheetTitle>
                <SheetDescription>
                 Start a 3-day free trial to experience what Chesski has to offer.
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
                <div className="flex flex-col items-center font-m text-sm">
                  <div className="font-light">3-day free trial, then</div>
                  <div className="space-x-1">
                    <span className="font-semibold">${Math.round(tier.price * 12) } /year</span>
                    <span className="">(${tier.price} /month)</span>
                  </div>
                </div>
              </div>
            </div>
            <SheetFooter>
              <div className="flex flex-col sm:space-y-6">
                {session && (
                  <Button
                    className="w-full"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      posthog.capture("sub_clicked");
                      await finishOnboarding();
                      const re = await fetch("/api/stripe/checkout/session", {
                        method: "POST",
                        body: JSON.stringify({
                          subType: SubType.Yearly,
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
                <Button onClick={async () => { await finishOnboarding(); setDone(true); } } size="thin" variant="link">Skip</Button>
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
