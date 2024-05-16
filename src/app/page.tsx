"use client";
import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context";
import { Navbar } from "@/components/Navbar";
import { useUserData } from "@/providers/UserDataProvider/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faMagnifyingGlassChart,
  faPuzzlePiece,
  faRobot,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { ChatPopupTrigger } from "@/components/ChatPopupTrigger";

const featureCards: {
  title: string;
  description: string;
  href: string;
  icon: IconDefinition;
}[] = [
  {
    title: "Play",
    description: "Learn with AI as you play",
    href: "/play",
    icon: faRobot,
  },
  {
    title: "Review",
    description: "Analyze mistakes from your past games",
    href: "/analysis",
    icon: faMagnifyingGlassChart,
  },
  {
    title: "Puzzles",
    description: "Train your weaknesses with custom puzzles",
    href: "/puzzles",
    icon: faPuzzlePiece,
  },
  {
    title: "Upgrade",
    description: "Get full access to all Chesski features",
    href: "/subscribe",
    icon: faRocket
  }
];

export default function Home() {
  const { name } = useUserData();
  const { session, supabase } = useAuth();

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto sm:justify-center">
      <Navbar showMobile={true} />
      <ChatPopupTrigger />
      <div className="flex flex-col justify-start pt-24 pb-16 sm:justify-center sm:items-center overflow-y-auto">
        <div className="flex flex-col space-y-2 text-black mb-12">
          <CardTitle className="text-center sm:text:left text-4xl flex flex-col sm:flex-row space-x-0 sm:space-x-2">
            <div>Welcome Back,</div> <div>{name}</div>
          </CardTitle>
          <CardDescription className="text-center sm:text:left text-xl font-medium">
            How you would like to train today?
          </CardDescription>
        </div>
        <div className="justify-items-center grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-fit">
          {featureCards.map((feat) => (
            <Link key={feat.title} href={feat.href} className="w-full px-4">
              <Card className="hover:scale-[1.05] w-full sm:w-96 h-40">
                <CardHeader className="items-start">
                  <FontAwesomeIcon size="lg" icon={feat.icon} color="#999999" />
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
