"use client";
import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context";
import { Button } from "@/components/ui/button";

import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";
import Image from "next/image";


export default function Home() {  
  const router = useRouter();

  const { session } = useAuth();

  return (
    <div className="h-full">
      <div className="flex flex-col justify-center items-center h-full">
        <div>
          <Image className="lp-img" src="/chesski-lp.png" alt="chess pieces" width={540} height={540} />
        </div>
        <div className="header">
          Master chess with ease. <span className="emph">Chesski</span> will guide you
        </div>
        <div className="sub-header">
          <p>Chesski is an <span className="emph">AI chess coach</span> that adapts to your playstyle and gives you <span className="emph">personalized advice</span>.</p>
        </div>
        <div className="sign-up">
          {!session && (
            <Drawer shouldScaleBackground={false}>
              <DrawerTrigger>
                <Button size="lg">Get Started</Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-5xl">
                  <Onboarding />
                </div>
              </DrawerContent>
            </Drawer>
          )}
          {session && (
            <Button size="lg" onClick={() => { router.push("/play") } }>Start Playing</Button>
          )}
        </div>
      </div>
    </div>
  );
}
