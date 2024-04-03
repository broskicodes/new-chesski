import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Sidebar } from "../Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser } from "@fortawesome/free-solid-svg-icons";
import { useUserData } from "@/providers/UserDataProvider/context";
import Link from "next/link";

interface Props {
  showMobile?: boolean
}

export const Navbar = ({ showMobile }: Props) => {
  const { session, signInWithOAuth, signOut } = useAuth();
  const router = useRouter();
  const { name } = useUserData();


  return (
    <div className={`navbar ${showMobile ? "" : "hidden"} sm:block z-40`}>
      <header className="navbar-container flex flex-row justify-between items-center py-2 text-white">
        <Link href="/" className="text-2xl font-bold arvo cursor-pointer">CHESSKI</Link>
        <nav className="flex flex-row space-x-4 items-center">
          <ul className="">
            {!session && <Button onClick={() => signInWithOAuth()}>Sign In</Button>}
            {session && (
              <Sidebar>
                <Button className="flex flex-row items-center space-x-2">
                  <FontAwesomeIcon icon={faUser} /><div>{name}</div>
                </Button>
              </Sidebar>
            )}
          </ul>
          <ul>
            <Sidebar>
              <Button variant="ghost" size="icon">
                <FontAwesomeIcon icon={faBars} size="2x" />
              </Button>
            </Sidebar>
            
          </ul>
        </nav>
      </header>
    </div>
  )
}