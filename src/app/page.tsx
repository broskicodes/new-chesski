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
import { useEffect, useState } from "react";
import { ONBOARDING_UPDATE_DATE } from "@/utils/types";


export default function Home() {  
  const [onboarded, setOnboarded] = useState(false);

  const router = useRouter();
  const { session, supabase } = useAuth();

  useEffect(() => {
    (async () => {
      if (session) {
        const { data: userData } = await supabase!.from('user_data')
          .select()
          .eq("uuid", session.id);

        // console.log(userData);
        if (userData && userData[0]) {
          const updateDate = new Date(userData[0].updated_at);

          if (updateDate > ONBOARDING_UPDATE_DATE) {
            setOnboarded(true);
          } else {
            setOnboarded(false)
          }
        }
      } else {
        const item = localStorage.getItem('userData');

        if (item) {
          setOnboarded(true);
        }
      }
    })();
  }, [session, supabase]);

  return (
    <div className="h-full">
      <div className="flex flex-col justify-center items-center h-full">
        <div>
          <Image className="lp-img" src="/chesski-lp.png" alt="chess pieces" width={540} height={540} />
        </div>
        <div className="header">
          Your guide to <span className="emph">chess mastery</span>
        </div>
        <div className="sub-header">
          <p>Chesski is an <span className="emph">AI chess coach</span> that adapts to your playstyle and gives you <span className="emph">personalized advice</span>.</p>
        </div>
        <div className="sign-up">
          {!onboarded && (
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
          {onboarded && (
            <Button size="lg" onClick={() => { router.push("/play") } }>Start Playing</Button>
          )}
        </div>
      </div>
    </div>
  );
}
