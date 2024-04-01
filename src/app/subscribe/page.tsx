"use client";

import { Button } from '@/components/ui/button';
import { SubType } from '@/utils/types';
import React from 'react';

const SubPage = () => {
  
  return (
    <div>
      <div>Pay me</div>
      <Button onClick={async () => { 
        const re = await fetch("/api/stripe/checkout/session", { 
          method: "POST", 
          body: JSON.stringify({ subType: SubType.Monthly }) 
        }); 

        const link = await re.text();

        window.location.href = link;
      }}>Monthly</Button>
      <Button onClick={async () => { 
        const re = await fetch("/api/stripe/checkout/session", { 
          method: "POST", 
          body: JSON.stringify({ subType: SubType.Yearly }) 
        }); 

        const link = await re.text();

        window.location.href = link;
      }}>Yearly</Button>
    </div>
  );
};

export default SubPage;
