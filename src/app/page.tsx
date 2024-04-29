"use client";
import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context";
import { Navbar } from "@/components/Navbar";
import { useUserData } from "@/providers/UserDataProvider/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition, faMagnifyingGlassChart, faRobot } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

const featureCards: {
  title: string,
  description: string,
  href: string,
  icon: IconDefinition
}[] = [
  {
    title: "Play",
    description: "Play a game against an adaptive AI",
    href: "/play",
    icon: faRobot
  },
  {
    title: "Analyze",
    description: "Identify mistakes and get insights from your past games",
    href: "/analysis",
    icon: faMagnifyingGlassChart
  }
]

export default function Home() {

  const { name } = useUserData();
  const { session, supabase } = useAuth();

  
  return (
    <div className="flex flex-col h-full">
      <Navbar />
      <div className="flex flex-col justify-center h-full">
        <div className="text-black mb-12">
          <CardTitle className="text-4xl">Welcome Back, {name}</CardTitle>
          <CardDescription className="text-xl font-medium">Choose how you would like to train today</CardDescription>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featureCards.map((feat) => (
            <Link key={feat.title} href={feat.href}>
              <Card className="hover:scale-[1.015] max-w-96 h-40">
                <CardHeader className="items-start">
                  <FontAwesomeIcon icon={feat.icon} color="#999999" />
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-1">{feat.title}</CardTitle>
                  <CardDescription>{feat.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
