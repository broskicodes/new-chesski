"use client";
import "./styles.css"

import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/providers/AuthProvider/context';
import { SubType } from '@/utils/types';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import posthog from 'posthog-js';
import React, { useMemo, useState } from 'react';

const SubPage = () => {
  const [annual, setAnnual] = useState(false);
  
  const { session, signInWithOAuth } = useAuth();
  const router = useRouter();
  
  const pricing = useMemo(() => ({
    tiers: [
      {
        title: 'Basic',
        price: 0,
        description: 'Get a taste of Chesski.',
        features: ['1 game per day', '3 analyses per day'],
        cta: 'Monthly billing',
        mostPopular: false,
      },
      {
        title: 'Pro',
        price: annual ? 120 : 15,
        description: 'Unlimited access to all features.',
        features: ['Unlimited games', 'Unlimited analysis', 'Full access to future features'],
        cta: 'Subscribe',
        mostPopular: true,
      }
    ]
  }), [annual])

  return (
    <div className="pb-8">
      <Navbar showMobile={true} />
      <div className='flex flex-col items-center space-y-4 mt-[64px] sm:mt-0'>
        <div className='font-bold text-4xl'>Subscribe to Chesski</div>
        {/* <div></div> */}
        <div className='flex flex-row space-x-2 items-center'>
          <Label className='text-lg'>Annual</Label>
          <Switch 
            checked={annual}
            onCheckedChange={(checked) => setAnnual(checked)}
            />
        </div>
      </div>
      <div className='flex flex-col space-y-8 sm:flex-row sm:space-x-16 sm:space-y-0 mt-8 sm:mt-12'>
        {pricing.tiers.map((tier) => (
          <Card key={tier.title} className={`${tier.mostPopular ? "border-4 border-indigo-500" : ""} relative sm:w-[312px]`}>
            {tier.mostPopular ? (
                <p className="absolute top-0 left-1/2 py-1.5 px-4 bg-indigo-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2 -translate-x-1/2">
                  Improve faster
                </p>
              ) : null}
            <CardHeader>
              <CardTitle className='text-2xl'>{tier.title}</CardTitle>
              <CardDescription className='text-md'>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col space-y-2 h-[105px]'>
              {tier.price > 0 && (
                <div><span className='font-bold text-3xl'>${tier.price}</span> /{annual ? "year" : "month"}</div>
              )}
              {tier.price === 0 && <span className='font-semibold text-3xl'>FREE</span>}
              {tier.price > 0 && (
                <div>
                  {session && (
                    <Button
                      className='w-full'
                      onClick={async () => { 
                        posthog.capture("sub_clicked")
                        const re = await fetch("/api/stripe/checkout/session", { 
                          method: "POST", 
                          body: JSON.stringify({ subType: annual ? SubType.Yearly : SubType.Monthly }) 
                        }); 

                        const link = await re.text();

                        router.push(link);
                      }}>
                      {tier.cta}
                    </Button>
                  )}
                  {!session && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        signInWithOAuth("subscribe");
                      }}>
                      Sign Up
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            <hr />
            <CardFooter className='h-[128px]'>
              <ul role="list" className="mt-4 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex">
                    <FontAwesomeIcon icon={faCircleCheck} className="flex-shrink-0 w-6 h-6 text-indigo-500" aria-hidden="true" />
                    <span className="ml-3 text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubPage;

