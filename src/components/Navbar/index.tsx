import "./styles.css";

import { useAuth } from "@/providers/AuthProvider/context"
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const { session, signInWithOAuth, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="navbar">
      <header className="navbar-container flex justify-between items-center p-4 text-white">
        <h1 className="text-2xl font-bold arvo">CHESSKI</h1>
        <nav>
          <ul className="flex space-x-4">
            {!session && <Button onClick={signInWithOAuth}>Sign In</Button>}
            {session && <Button onClick={async () => {
              await signOut();
              router.push("/");
            }}>Sign Out</Button>}
          </ul>
        </nav>
      </header>
    </div>
  )
}