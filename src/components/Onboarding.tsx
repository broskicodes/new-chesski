import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { useRouter } from "next/navigation";


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

export const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [experience, setExperience] = useState<Experience>(Experience.Beginner);
  const [goal, setGoal] = useState<Goal>(Goal.Casual);

  const maxSteps = useMemo(() => 4, []);

  const router = useRouter();

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
                <Card key={exp} className="flex flex-col items-center space-y-6 cursor-pointer" onClick={() => setExperience(exp as Experience)}>
                  {/* <CardHeader /> */}
                  <div />
                  <CardContent>
                    <Avatar>
                      <AvatarImage />
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
                <Button onClick={() => setStep(step + 1)}>Next</Button>
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
          <div className="flex flex-col space-y-4 justify-center py-8 mx-auto max-w-2xl">
            {Object.entries(Goal).filter(([val]) => isNaN(parseInt(val))).map(([val, g], i) => {
              return (
                <div key={g} className="flex flex-row justify-between cursor-pointer w-full" onClick={() => setGoal(g as Goal)}>
                  {val}
                </div>
              )
            })}
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
      )}
      {step === 2 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Connect your chess accounts</DrawerTitle>
              <DrawerDescription>Give Chesski access to your historical game data.</DrawerDescription>
            </div>
          </DrawerHeader>
          {/* <div className="flex flex-col space-y-4 justify-center py-8 mx-auto max-w-2xl">
            {Object.entries(Goal).filter(([val]) => isNaN(parseInt(val))).map(([val, g], i) => {
              return (
                <div className="flex flex-row justify-between cursor-pointer w-full" onClick={() => setGoal(g as Goal)}>
                  {val}
                </div>
              )
            })}
          </div> */}
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
      )}
      {step === 3 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Where did you hear about Chesski?</DrawerTitle>
              <DrawerDescription>This will help us reach more players.</DrawerDescription>
            </div>
          </DrawerHeader>
          {/* <div className="flex flex-col space-y-4 justify-center py-8 mx-auto max-w-2xl">
            {Object.entries(Goal).filter(([val]) => isNaN(parseInt(val))).map(([val, g], i) => {
              return (
                <div className="flex flex-row justify-between cursor-pointer w-full" onClick={() => setGoal(g as Goal)}>
                  {val}
                </div>
              )
            })}
          </div> */}
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
      )}
      {step === 4 && (
        <div>
          <DrawerHeader>
            <div className="flex flex-col space-y-1">
              <DrawerTitle>Let&apos;s get started!</DrawerTitle>
              <DrawerDescription>No more delays. Start using Chesski now!</DrawerDescription>
            </div>
          </DrawerHeader>
          {/* <div className="flex flex-col space-y-4 justify-center py-8 mx-auto max-w-2xl">
            {Object.entries(Goal).filter(([val]) => isNaN(parseInt(val))).map(([val, g], i) => {
              return (
                <div className="flex flex-row justify-between cursor-pointer w-full" onClick={() => setGoal(g as Goal)}>
                  {val}
                </div>
              )
            })}
          </div> */}
          <DrawerFooter>
            <div className="flex flex-col space-y-6">
              <div className="mx-auto">
                <Button onClick={() => { router.push("/play") }}>Let&apos;s go!</Button>
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