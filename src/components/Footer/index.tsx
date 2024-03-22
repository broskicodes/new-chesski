import Link from "next/link";
import "./styles.css";
import Image from "next/image";
import { buttonVariants } from "../ui/button";

export function Footer() {
  return (
    <div id="footer">
      <div className="footer-container flex flex-row justify-between items-center text-white py-4">
        <div>
          <div>
            <div className="flex flex-row">
              <Image src="/chesski-logo.svg" width={24} height={24} alt="k" />
              <div className="arvo text-2xl font-bold">CHESSKI</div>
            </div>
            <div>The best way to improve at chess</div>
          </div>
        </div>
        <div className="flex flex-col">
          <Link href="mailto:braeden@chesski.lol" className={`${buttonVariants({ variant: "link" })} text-white`}>Give Feedback</Link>
          <Link href="mailto:braeden@chesski.lol" className={`${buttonVariants({ variant: "link" })} text-white`}>Support Creator</Link>

        </div>
      </div>
    </div>
  );
}