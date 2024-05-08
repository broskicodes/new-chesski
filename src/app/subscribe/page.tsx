"use client";
import "./styles.css";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/AuthProvider/context";
import { useUserData } from "@/providers/UserDataProvider/context";
import {
  CHESSKI_MONTHLY_PRICE,
  CHESSKI_YEARLY_PRICE,
  SubType,
} from "@/utils/types";
import { faBell, faCheck, faCircleCheck, faStar, faUnlock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { FreeTrialModal } from "@/components/FreeTrialModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SubPage = () => {
  // const [annual, setAnnual] = useState(true);
  const [currTab, setCurrTab] = useState("yearly")
  const [loading, setLoading] = useState(false);

  const { isPro } = useUserData();
  const { session, signInWithOAuth } = useAuth();
  const router = useRouter();

  const pricing = useMemo(
    () => ({
      tiers: [
        // {
        //   title: "Basic",
        //   price: 0,
        //   description: "Get a taste of Chesski.",
        //   features: ["Unlimited games", "Analyze 3 positions a day", "Analyze 2 games per day"],
        //   cta: "Monthly billing",
        //   mostPopular: false,
        // },
        // {
        //   title: "Pro",
        //   price: currTab === "yearly" ? Math.round(CHESSKI_YEARLY_PRICE / 12 * 100) / 100 : CHESSKI_MONTHLY_PRICE,
        //   description: "Start improving for only.",
        //   promo: "Try free for 3 days",
        //   features: [
        //     "Unlimited game and position analysis",
        //     "Custom AI insights",
        //     "24hr support from the founder",
        //     "Access to all new features",
        //   ],
        //   cta: "Start 3-day free trial",
        //   mostPopular: true,
        // },
        {
          title: "Trial",
          description: "Understand your free trial",
          price: currTab === "yearly" ? Math.round(CHESSKI_YEARLY_PRICE / 12 * 100) / 100 : CHESSKI_MONTHLY_PRICE,
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
        }
      ],
    }),
    [currTab],
  );

  useEffect(() => {
    // if (session && !isPro) {
    (async () => {
      const res = await fetch("/subscribe/free-trial", { method: "POST" });
      console.log(res.ok);
    })();
    // }
  }, []);

  return (
    <div className="pb-8 h-full flex flex-col sm:justify-center sm:items-center overflow-y-scroll">
      <Navbar showMobile={true} />
      {/* <Suspense>
        <FreeTrialModal />
      </Suspense> */}
      {/* <div className="flex flex-col items-center space-y-4 mt-[64px] sm:mt-0">
        <div className="font-bold text-4xl">Subscribe to Chesski</div>
        <div className="flex flex-row space-x-2 items-center">
          <Label className="text-lg">Annual</Label>
          <Switch
            checked={annual}
            onCheckedChange={(checked) => setAnnual(checked)}
          />
        </div>
      </div> */}
      <Tabs 
        className="flex flex-col items-center space-y-6 mt-20 sm:mt-0"
        defaultValue="yearly"
        onValueChange={(val) => {
          setCurrTab(val);
        }} >
        <TabsList className="w-60 h-12">
          <TabsTrigger value="yearly" className="w-full h-full">Yearly</TabsTrigger>
          <TabsTrigger value="monthly" className="w-full h-full">Monthly</TabsTrigger>
        </TabsList>
        {["monthly", "yearly"].map((type: string) => (
          <TabsContent key={type} value={type}>
            {pricing.tiers.map((tier) => (
              <div key={tier.title} className="flex flex-col items-center">
                <span className="font-bold text-3xl sm:text-4xl font-m mb-8 text-center">{tier.description}</span>
                <ul role="list" className="mb-8 space-y-6 text-sm w-full px-8 sm:w-96 sm:px-0">
                  {tier.steps.map((step) => (
                    <li key={step.h} className="grid grid-cols-12 gap-x-4 items-center">
                      <div className={`place-self-center rounded-full p-3 shadow ${!step.d ? "bg-white" : "bg-[#1b03a3]/50"}`}>
                        <FontAwesomeIcon
                          icon={step.i}
                          size="xl"
                          className={`flex-shrink-0  ${step.d ? "text-white" : "text-[#1b03a3]"}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex flex-col ml-2 col-span-11">
                        <span className={`text-xl font-bold text-[#1b03a3] ${step.d ? "opacity-70 line-through decoration-1" : ""}`}>{step.h}</span>
                        <span className="text-gray-500">{step.sh}</span>
                        </div>
                    </li>
                  ))}
                </ul>
                <div className="mb-2 flex flex-col items-center font-m">
                  <div className="font-light">3-day free trial, then</div>
                  <div className="space-x-1">
                    {type === "yearly" && <span className="font-semibold">${Math.round(tier.price * 12) } /year</span>}
                    <span className={`${type === "yearly" ? "" : "font-semibold"}`}>{type === "yearly" && "("}${tier.price} /month{type === "yearly" && ")"}</span>
                  </div>
                </div>
                {session && !isPro && (
                  <Button
                    size="lg"
                    className="w-60"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true)
                      posthog.capture("sub_clicked");
                      const re = await fetch("/api/stripe/checkout/session", {
                        method: "POST",
                        body: JSON.stringify({
                          subType: currTab === "yearly" ? SubType.Yearly : SubType.Monthly,
                          // @ts-ignore
                          referral: window.tolt_referral,
                          trial: true
                        }),
                      });

                      const link = await re.text();

                      router.push(link);
                    }}
                  >
                    {!loading && <span className="font-bold text-xl">{tier.cta}</span>}
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1B03A3]" />}
                  </Button>
                )}
                {session && isPro && (
                  <Button
                    disabled
                    size="lg"
                    className="w-60 disabled:opacity-70 disabled:bg-[#1b03a3] disabled:ring-gred:ring-4"
                  >
                    <span className="font-bold text-xl">Subscribed</span>
                  </Button>
                )}
                {!session && (
                  <Button
                    size="lg"
                    className="w-60"
                    onClick={() => {
                      signInWithOAuth("subscribe");
                    }}
                  >
                    <span className="font-bold text-xl">Sign Up</span>
                  </Button>
                )}
                
              </div>
              // <Card
              //   key={tier.title}
              //   // className={`${tier.mostPopular ? "border-4 border-indigo-500" : ""} relative sm:w-[312px]`}
              // >
              //   {/* {tier.mostPopular ? (
              //     <p className="absolute top-0 left-1/2 py-1.5 px-4 bg-indigo-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2 -translate-x-1/2">
              //       Improve faster
              //     </p>
              //   ) : null} */}
              //   <CardHeader>
              //     <CardTitle className="text-2xl">{tier.title}</CardTitle>
              //     {/* <CardDescription className="text-md">
              //       {tier.description}
              //     </CardDescription> */}
              //   </CardHeader>
              //   <CardContent className="flex flex-col space-y-2 h-[105px]">
              //     {tier.price > 0 && (
              //       <div>
              //         <span className="font-bold text-3xl">${tier.price}</span> /month
              //         {/* {annual ? "year" : "month"} */}
              //       </div>
              //     )}
              //     {tier.price === 0 && (
              //       <span className="font-semibold text-3xl">FREE</span>
              //     )}
              //     {tier.price > 0 && (
              //       <div>
              //         {session && !isPro && (
              //           <Button
              //             className="w-full"
              //             onClick={async () => {
              //               posthog.capture("sub_clicked");
              //               const re = await fetch("/api/stripe/checkout/session", {
              //                 method: "POST",
              //                 body: JSON.stringify({
              //                   subType: currTab === "yearly" ? SubType.Yearly : SubType.Monthly,
              //                   // @ts-ignore
              //                   referral: window.tolt_referral,
              //                   trial: true
              //                 }),
              //               });

              //               const link = await re.text();

              //               router.push(link);
              //             }}
              //           >
              //             {tier.cta}
              //           </Button>
              //         )}
              //         {session && isPro && (
              //           <Button
              //             disabled
              //             className="w-full disabled:opacity-70 disabled:bg-[#1b03a3] disabled:ring-gred:ring-4"
              //           >
              //             Current Plan
              //           </Button>
              //         )}
              //         {!session && (
              //           <Button
              //             className="w-full"
              //             onClick={() => {
              //               signInWithOAuth("subscribe");
              //             }}
              //           >
              //             Sign Up
              //           </Button>
              //         )}
              //       </div>
              //     )}
              //   </CardContent>
              //   <hr />
              //   <CardFooter className="h-[164px]">
                  // <ul role="list" className="mt-4 space-y-2">
                  //   {tier.features.map((feature) => (
                  //     <li key={feature} className="flex">
                  //       <FontAwesomeIcon
                  //         icon={faCircleCheck}
                  //         className="flex-shrink-0 w-6 h-6 text-indigo-500"
                  //         aria-hidden="true"
                  //       />
                  //       <span className="ml-3 text-gray-500">{feature}</span>
                  //     </li>
                  //   ))}
                  // </ul>
              //   </CardFooter>
              // </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SubPage;
