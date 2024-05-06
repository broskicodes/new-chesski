import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context";
import { Button, buttonVariants } from "../ui/button";
import { useRouter } from "next/navigation";
import { Sidebar } from "../Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faEnvelope, faUser } from "@fortawesome/free-solid-svg-icons";
import { useUserData } from "@/providers/UserDataProvider/context";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Textarea } from "../ui/textarea";
import { PopoverClose } from "@radix-ui/react-popover";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface Props {
  showMobile?: boolean;
}

export const Navbar = ({ showMobile }: Props) => {
  const [feedback, setFeedback] = useState("");

  const { session, signInWithOAuth, signOut } = useAuth();
  const router = useRouter();
  const { name, isPro } = useUserData();
  const { toast } = useToast();

  return (
    <div className={`navbar${showMobile ? " " : " hidden "}sm:block z-40`}>
      <header className="navbar-container px-4 sm:pl-0 flex flex-row w-full items-center py-2 text-white">
        <Link href={"/"} className="text-xl sm:text-2xl font-bold arvo cursor-pointer">
          CHESSKI
        </Link>
        <div className="sm:hidden flex flex-row justify-end w-full">
          <ul className="flex flex-row space-x-1 items-center">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button size="sm" variant="secondary">Support</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link href="mailto:braeden@chesski.lol">
                    <DropdownMenuItem className="cursor-pointer w-40">
                      Email Support
                      <DropdownMenuShortcut>
                        <FontAwesomeIcon icon={faEnvelope} size="lg" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              {isPro && (
                <Sidebar>
                  <Button size="sm" className="flex flex-row items-center space-x-2">
                    <FontAwesomeIcon icon={faUser} />
                    <div>{name}</div>
                  </Button>
                </Sidebar>
              )}
              {!isPro && (
                <Link href="/subscribe" className={buttonVariants({ size: "sm" })}>
                  Upgrade
                </Link>
              )}
            </li>
            {/* <li>
              <Sidebar>
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faBars} size="xl" />
                </Button>
              </Sidebar>
            </li> */}
          </ul>
        </div>
        <div className="hidden sm:flex flex-row justify-between w-full ml-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/play">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Play
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/analysis">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Analyze
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <ul className="flex flex-row space-x-2 items-center">
            <li>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="secondary">Support</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link href="mailto:braeden@chesski.lol">
                    <DropdownMenuItem className="cursor-pointer w-40">
                      Email Support
                      <DropdownMenuShortcut>
                        <FontAwesomeIcon icon={faEnvelope} size="lg" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
            <li>
              <Popover>
                <PopoverTrigger>
                  <Button variant="secondary">Feedback</Button>
                </PopoverTrigger>
                <PopoverContent className="flex flex-col space-y-2">
                  <Textarea
                    placeholder="How can we improve Chesski?"
                    value={feedback}
                    onChange={({ target }) => {
                      setFeedback(target.value);
                    }}
                  />
                  <div className="flex flex-row justify-between">
                    <PopoverClose>
                      <Button size="thin" variant="outline">
                        Cancel
                      </Button>
                    </PopoverClose>
                    <PopoverClose>
                      <Button
                        size="thin"
                        onClick={async () => {
                          setFeedback("");
                          await fetch("/api/feedback", {
                            method: "POST",
                            body: JSON.stringify({
                              feedback: feedback,
                              email: session?.email,
                              uid: session?.id,
                            }),
                          });

                          toast({
                            title: "Message sent",
                            description: "Thanks for your feedback!",
                          });
                        }}
                      >
                        Send
                      </Button>
                    </PopoverClose>
                  </div>
                </PopoverContent>
              </Popover>
            </li>
            <li>
              {isPro && (
                <Sidebar>
                  <Button className="flex flex-row items-center space-x-2">
                    <FontAwesomeIcon icon={faUser} />
                    <div>{name}</div>
                  </Button>
                </Sidebar>
              )}
              {!isPro && (
                <Link href="/subscribe" className={buttonVariants()}>
                  Upgrade
                </Link>
              )}
            </li>
            <li>
              <Sidebar>
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faBars} size="2x" />
                </Button>
              </Sidebar>
            </li>
          </ul>
        </div>
      </header>
    </div>
  );
};
