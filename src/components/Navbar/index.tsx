import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Sidebar } from "../Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
  const { session, signInWithOAuth, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="navbar">
      <header className="navbar-container flex justify-between items-center p-2 text-white">
        <h1 className="text-2xl font-bold arvo">CHESSKI</h1>
        <nav className="flex flex-row space-x-4 items-center">
          <ul className="">
            {!session && <Button onClick={signInWithOAuth}>Sign In</Button>}
            {session && <Button onClick={async () => {
              await signOut();
              router.push("/");
            }}>Sign Out</Button>}
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