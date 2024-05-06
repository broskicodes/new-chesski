"use client";

import { useUserData } from "@/providers/UserDataProvider/context";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { ReactNode, useState } from "react";
import { Experience, STRIPE_LINK } from "@/utils/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/providers/AuthProvider/context";
import { usePathname, useRouter } from "next/navigation";
import posthog from "posthog-js";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { StreakIcon } from "./StreakIcon";
import { Label } from "./ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faHome, faMagnifyingGlassChart, faRobot, faUser } from "@fortawesome/free-solid-svg-icons";

interface Props {
  children: ReactNode;
  panel?: Panel
}

export enum Panel {
  Default = "Defalut",
  Profile = "Profile",
  Settings = "Settings"
}

export const Sidebar = ({ children, panel }: Props) => {
  const [editing, setEditing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<Panel>(panel ?? Panel.Default)

  const { toast } = useToast();
  const { signOut, signInWithOAuth, session } = useAuth();
  const {
    lichess,
    chesscom,
    experience,
    name,
    isPro,
    pfp,
    updateChesscom,
    updateLichess,
    updateExperience,
    saveData,
    getData,
  } = useUserData();

  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent>
      {selectedPanel === Panel.Default && (
        <div className="h-full">
          <SheetHeader>
            <SheetTitle className="arvo">CHESSKI</SheetTitle>
          </SheetHeader>
          <div className="mt-6 sm:mt-12 w-full">
            <ul className="w-full px-2 flex flex-col space-y-2">
              <li className={`py-2 px-2 rounded-md hover:bg-gray-200/50 ${pathname === "/" ? "bg-gray-200/25" : ""}`}>
                <Link className="grid grid-cols-12 space-x-3" href="/">
                  <FontAwesomeIcon className="place-self-center" icon={faHome} />
                  <span className="col-span-11 justify-self-start">Home</span>
                </Link>
              </li>
              <li className={`py-2 px-2 rounded-md hover:bg-gray-200/50 ${pathname === "/play" ? "bg-gray-200/25" : ""}`}>
                <Link className="grid grid-cols-12 space-x-3 items-center" href="/play">
                  <FontAwesomeIcon className="place-self-center" icon={faRobot} />
                  <span className="col-span-11 justify-self-start">Play</span>
                </Link>
              </li>
              <li className={`py-2 px-2 rounded-md hover:bg-gray-200/50 ${pathname === "/analysis" ? "bg-gray-200/25" : ""}`}>
                <Link className="grid grid-cols-12 space-x-3 items-center" href="analysis">
                  <FontAwesomeIcon className="place-self-center" icon={faMagnifyingGlassChart} />
                  <span className="col-span-11 justify-self-start">Analyze</span>
                </Link>
              </li>
              <li className={`py-2 px-2 rounded-md hover:bg-gray-200/50`}>
                <button className="grid grid-cols-12 space-x-3 items-center w-full" onClick={() => {
                  setSelectedPanel(Panel.Profile);
                }}>
                  <FontAwesomeIcon className="place-self-center" icon={faUser} />
                  <span className="col-span-11 justify-self-start">Profile</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
      {selectedPanel === Panel.Profile && (
        <div className="h-full">
          <SheetHeader className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-0 -translate-y-4 sm:-translate-x-4"
              onClick={() => {
                setSelectedPanel(Panel.Default)
              }}><FontAwesomeIcon icon={faArrowLeft} /></Button>
            <SheetTitle className="arvo">PROFILE</SheetTitle>
          </SheetHeader>
          <div className="h-full flex flex-col relative">
            <div className="mt-6 sm:mt-12">
              {/* <Avatar size="sm">
                <AvatarImage src={pfp} />
                <AvatarFallback>{name.split(" ")[0][0] ?? "N"}{name.split(" ")[1][0] ?? "N"}</AvatarFallback>
              </Avatar> */}
              <div className="font-semibold">{name}</div>
              <StreakIcon />
            </div>
            <div className="flex flex-col space-y-8 mt-12 sm:mt-24">
              <div className="flex flex-col space-y-4">
                <SheetDescription>Linked Accounts</SheetDescription>
                <div className="flex flex-col space-y-2">
                  <div className="">
                    <Label>Chess.com</Label>
                    <Input
                      disabled={!editing}
                      placeholder="Chess.com"
                      value={chesscom ?? ""}
                      onChange={({ target }) => updateChesscom(target.value)}
                    />
                  </div>
                  <div>
                  <Label>Lichess</Label>
                  <Input
                    disabled={!editing}
                    placeholder="Lichess"
                    value={lichess ?? ""}
                    onChange={({ target }) => updateLichess(target.value)}
                  />
                  </div>
                </div>
              </div>
              {/* <div className="flex flex-col space-y-4">
                <SheetDescription>PREFERENCES</SheetDescription>
                <Select
                  disabled={!editing}
                  value={Object.entries(Experience)[experience][1] as string}
                  onValueChange={(val) =>
                    updateExperience(
                      Number(
                        Object.entries(Experience).filter(
                          (e) => e[1] === val,
                        )[0][0],
                      ) as Experience,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Skill Level</SelectLabel>
                      {Object.entries(Experience)
                        .filter(([k]) => !isNaN(Number(k)))
                        .map(([k, v]) => {
                          return (
                            <SelectItem key={k} value={v as string}>
                              {v}
                            </SelectItem>
                          );
                        })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div> */}
              <div className="w-full">
                {editing && (
                  <div className="flex flex-row space-x-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={async () => {
                        await getData();
                        setEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-full"
                      onClick={async () => {
                        await saveData();
                        setEditing(false);

                        const { dismiss } = toast({
                          title: "Profile saved",
                        });
                        setTimeout(() => {
                          dismiss();
                        }, 1500);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                )}
                {!editing && session && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
                {!editing && !session && (
                  <Button className="w-full" onClick={() => signInWithOAuth()}>
                    Sign in to edit
                  </Button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
      <div className="flex flex-col items-start absolute bottom-8 sm:bottom-12 w-full">
        {!isPro && (
          <Link
            href={`/subscribe`}
            className={buttonVariants({ variant: "ghost" })}
          >
            Subscribe
          </Link>
        )}
        {isPro && (
          <Button
            variant="ghost"
            // className={buttonVariants({ variant: "ghost" })}
            onClick={async () => {
              // posthog.capture("dono_clicked")
              const res = await fetch("/api/stripe/subscription", {
                method: "POST",
              });
              const link = await res.text();

              router.push(link);
            }}
          >
            Manage Subscription
          </Button>
        )}
        <div className="flex flex-row w-full justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(
                process.env.NEXT_PUBLIC_ENV === "dev"
                  ? window.location.origin
                  : "https://chesski.lol",
              );

              posthog.capture("share_clicked");
              setLinkCopied(true);
              setTimeout(() => {
                setLinkCopied(false);
              }, 3000);
            }}
          >
            Invite Friends
          </Button>
          {linkCopied && (
            <SheetDescription className="font-medium">
              Link Copied!
            </SheetDescription>
          )}
        </div>
        {session && (
          <Dialog>
            <DialogTrigger className={buttonVariants({ variant: "ghost" })}>
              Sign Out
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="flex flex-col items-center">
                <DialogTitle>
                  Are you sure you want to sign out?
                </DialogTitle>
                <DialogDescription>
                  {"If you do, I'll be sad :("}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-row space-x-2 w-full">
                <DialogClose asChild className="w-full">
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="default"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {!session && (
          <Button
            variant="ghost"
            onClick={async () => {
              await signInWithOAuth();
            }}
          >
            Sign In
          </Button>
        )}
      </div>
      </SheetContent>
    </Sheet>
  );
};
