"use client";

import { BottomNav } from "@/components/BottomNav";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";

export default function Delete() {
  return (
    <div className="flex flex-col h-full justify-center">
      <Navbar />
      <BottomNav />
      
      <Button>Delete Account</Button>
    </div>
  )
}