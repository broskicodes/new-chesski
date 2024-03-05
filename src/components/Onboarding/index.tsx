import './styles.css';

import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCallback, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";


enum Experience {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
  Master = 3
}

enum Goal {
  Casual = 0,
  Curious = 1,
  Commited = 2,
}

interface UserData {
  chesscom_name: string;
  lichess_name: string;
  learning_goal: Goal;
  skill_level: Experience;
}

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [chesscom, setChesscom] = useState("")
  const [lichess, setLichess] = useState("")

  const maxSteps = useMemo(() => 3, []);

  const router = useRouter();

  const finishOnboarding = useCallback(() => {
    const userData: UserData = {
      chesscom_name: chesscom,
      lichess_name: lichess,
      learning_goal: goal!,
      skill_level: experience!
    }

    localStorage.setItem("userData", JSON.stringify(userData));
    router.push("/play");
  }, [experience, goal, chesscom, lichess])

  return (
    <div>
      {step === 0 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>{"What's your skill level?"}</DrawerTitle>
              <DrawerDescription>This will help Chesski personalize its coaching.</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex flex-row space-x-8 justify-center py-8">
            {Object.entries(Experience).filter(([val]) => isNaN(parseInt(val))).map(([val, exp], i) => {
              return (
                <Card key={exp} className={`flex flex-col items-center space-y-6 cursor-pointer hover:bg-[#1B03A3]/20 ${exp === experience ? "bg-[#1B03A3]/10" : ""}`} onClick={() => { setExperience(exp as Experience) }}>
                  {/* <CardHeader /> */}
                  <div />
                  <CardContent>
                    <Avatar>
                      <AvatarImage src={`/pieces/${exp}.png`} />
                      <AvatarFallback>{val}</AvatarFallback>
                    </Avatar>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-0 text-center">
                    <span className="font-medium text-sm">Level {i + 1}</span>
                    <span className="font-bold text-xl">{val}</span>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={() => setStep(step + 1)} disabled={experience === null}>Next</Button>
              </div>
              <div className="flex flex-row items-center">
                <Button size="icon" variant="ghost" className="invisible" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                <Progress  className="mx-auto w-3/4" value={step / maxSteps * 100} />
              </div>
            </div>
          </DrawerFooter>
        </div>
      )}
      {step === 1 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Set your learning goal</DrawerTitle>
              <DrawerDescription>How much time will you dedicate to practicing each day?</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex flex-col space-y-6 justify-center py-8 mx-auto max-w-2xl min-h-[370px]">
            {Object.entries(Goal).filter(([val]) => isNaN(parseInt(val))).map(([val, g], i) => {
              let epd = 0;
              switch (g) {
                case Goal.Casual:
                  epd = 1;
                  break;
                case Goal.Curious:
                  epd = 5;
                  break;
                case Goal.Commited:
                  epd = 10
                  break;
              }

              return (
                <div key={g} className={`lg-row bg-[#f1f1f1] hover:bg-[#1B03A3]/20 ${g === goal ? "bg-[#1B03A3]/10" : ""}`} onClick={() => setGoal(g as Goal)}>
                  <span className="font-bold text-xl">{val}</span>
                  <span>{epd} exercise{epd !== 1 ? "s" : ""} / day</span>
                </div>
              )
            })}
          </div>
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={() => setStep(step + 1)} disabled={goal === null}>Next</Button>
              </div>
              <div className="flex flex-row items-center">
                <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                <Progress  className="mx-auto w-3/4" value={step / maxSteps * 100} />
              </div>
            </div>
          </DrawerFooter>
        </div>
      )}
      {step === 2 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Connect your chess accounts</DrawerTitle>
              <DrawerDescription>Give Chesski access to your historical game data.</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex flex-col space-y-8 justify-center py-8 mx-auto max-w-2xl min-h-[370px]">
            <Input placeholder="Chess.com" value={chesscom} onChange={({ target }) => setChesscom(target.value) } />
            <Input placeholder="Lichess" value={lichess} onChange={({ target }) => setLichess(target.value) }/>
          </div>
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={() => setStep(step + 1)}>{chesscom.length > 0 || lichess.length > 0 ? "Next" : "Skip"}</Button>
              </div>
              <div className="flex flex-row items-center">
                <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                <Progress  className="mx-auto w-3/4" value={step / maxSteps * 100} />
              </div>
            </div>
          </DrawerFooter>
        </div>
      )}
      {/* {step === 3 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Where did you hear about Chesski?</DrawerTitle>
              <DrawerDescription>This will help us reach more players.</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex flex-col space-y-4 justify-center py-8 mx-auto max-w-2xl min-h-[370px]">
            
          </div>
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={() => setStep(step + 1)}>Next</Button>
              </div>
              <div className="flex flex-row items-center">
                <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                <Progress  className="mx-auto w-3/4" value={step / maxSteps * 100} />
              </div>
            </div>
          </DrawerFooter>
        </div>
      )} */}
      {step === 3 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Let&apos;s get started!</DrawerTitle>
              <DrawerDescription>No more delays. Start using Chesski now!</DrawerDescription>
            </div>
          </DrawerHeader>
          <div className="flex flex-col space-y-8 justify-center items-center py-8 mx-auto max-w-2xl min-h-[370px]">
            <h1 className='font-bold text-4xl'>
              Congrats!
            </h1>
            <h2 className='font-medium text-2xl'>
              Onboarding is finished. Let's get you practicing!
            </h2>
          </div>
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={finishOnboarding}>Let&apos;s go!</Button>
              </div>
              <div className="flex flex-row items-center">
                <Button size="icon" variant="ghost" onClick={() => setStep(step - 1)}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                <Progress  className="mx-auto w-3/4" value={step / maxSteps * 100} />
              </div>
            </div>
          </DrawerFooter>
        </div>
      )}
    </div>
  )
}