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
    description: "Learn with AI as you play",
    href: "/play",
    icon: faRobot
  },
  {
    title: "Analyze",
    description: "Find mistakes from your past games",
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
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-col space-y-2 text-black mb-12">
          <CardTitle className="text-center sm:text:left text-4xl flex flex-col sm:flex-row space-x-0 sm:space-x-2"><div>Welcome Back,</div> <div>{name}</div></CardTitle>
          <CardDescription className="text-center sm:text:left text-xl font-medium">Choose how you would like to train today</CardDescription>
        </div>
        <div className="justify-items-center grid grid-cols-1 sm:grid-cols-2 gap-4">
          {featureCards.map((feat) => (
            <Link key={feat.title} href={feat.href}>
              <Card className="hover:scale-[1.015] w-96 h-40">
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
