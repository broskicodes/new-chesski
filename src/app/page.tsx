"use client";
import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context";
import { Button } from "@/components/ui/button";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Onboarding } from "@/components/Onboarding";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ONBOARDING_UPDATE_DATE } from "@/utils/types";
import { Navbar } from "@/components/Navbar";

export default function Home() {

  const router = useRouter();
  const { session, supabase } = useAuth();

  return (
    <div className="h-full">
      <Navbar />
    </div>
  );
}
