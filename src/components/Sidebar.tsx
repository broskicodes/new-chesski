"use client";

import { useUserData } from "@/providers/UserDataProvider/context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { ReactNode, useState } from "react";
import { Experience } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/providers/AuthProvider/context";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import Link from "next/link";

interface Props {
  children: ReactNode;
}

const stripeLink = "https://donate.stripe.com/7sIaHVg9WbnLcla4gg";

export const Sidebar = ({ children }: Props) => {
  const [editing, setEditing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { toast } = useToast();
  const { signOut, signInWithOAuth, session } = useAuth();
  const router = useRouter();
  const { lichess, chesscom, experience, name, pfp, updateChesscom, updateLichess, updateExperience, saveData, getData } = useUserData();

  // alert(pfp)
  return (
    <Sheet>
      <SheetTrigger>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Profile
          </SheetTitle>
        </SheetHeader>
        <div className="h-full flex flex-col relative">
          <div className="mt-6 sm:mt-12">
            {/* <Avatar size="sm">
              <AvatarImage src={pfp} />
              <AvatarFallback>{name.split(" ")[0][0] ?? "N"}{name.split(" ")[1][0] ?? "N"}</AvatarFallback>
            </Avatar> */}
            <div className="font-semibold">{name}</div>
          </div>
          <div className="flex flex-col space-y-8 mt-12 sm:mt-24">
            <div className="flex flex-col space-y-4">
              <SheetDescription>SOCIAL</SheetDescription>
              <div className="flex flex-col space-y-2">
                <Input disabled={!editing} placeholder="Chess.com" value={chesscom ?? ""} onChange={({ target }) => updateChesscom(target.value)}/>
                <Input disabled={!editing} placeholder="Lichess" value={lichess ?? ""} onChange={({ target }) => updateLichess(target.value)}/>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <SheetDescription>PREFERENCES</SheetDescription>
              <Select disabled={!editing} value={Object.entries(Experience)[experience][1] as string} onValueChange={(val) => updateExperience(Number(Object.entries(Experience).filter((e) => e[1] === val)[0][0]) as Experience)}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Skill Level</SelectLabel>
                    {Object.entries(Experience).filter(([k]) => !isNaN(Number(k))).map(([k, v]) => {
                      return (
                        <SelectItem key={k} value={v as string}>{v}</SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">              
              {editing && (
                <div className="flex flex-row space-x-2">
                  <Button className="w-full" variant="outline" 
                    onClick={async () => {
                      await getData();
                      setEditing(false);
                    }}>
                    Cancel
                  </Button>
                  <Button className="w-full" onClick={async () => { 
                    await saveData(); 
                    setEditing(false);

                    const { dismiss } = toast({
                      title: "Profile saved"
                    });
                    setTimeout(() => {
                      dismiss()
                    }, 1500);
                  }}>
                    Save
                  </Button>
                </div>
              )}
              {!editing && session && (
                <Button className="w-full" onClick={() => { setEditing(true) }}>
                  Edit
                </Button>
              )}
              {!editing && !session && (
                <Button className="w-full" onClick={signInWithOAuth}>
                  Sign in to edit
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start absolute bottom-8 sm:bottom-12 w-full">
            <Link href={`${stripeLink}?${session ? `prefilled_email=${session.email}`: ""}`} target="_blank" className={buttonVariants({ variant: "ghost" })}>
              Support Chesski
            </Link>
            <div className="flex flex-row w-full justify-between items-center">
              <Button variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);

                  posthog.capture("share_clicked");
                  setLinkCopied(true);
                  setTimeout(() => {
                    setLinkCopied(false);
                  }, 3000);
                }}
                >
                Invite Friends
              </Button>
              {linkCopied && <SheetDescription className="font-medium">Link Copied!</SheetDescription>}
            </div>
            {session && (
              <Button variant="ghost" onClick={async () => {
                await signOut();
                router.push("/");
                }}>
                Sign Out
              </Button>
            )}
            {!session && (
              <Button variant="ghost" onClick={async () => {
                await signInWithOAuth();
                }}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}