import Link from "next/link";
import "./styles.css";

export function Footer() {
  return (
    <div id="footer">
      <p className="text-white pl-2 sm:pl-4 custom-text">Email support at: <Link href="mailto:braeden@chesski.lol" className="underline semi-bold">braeden@chesski.lol</Link></p>
    </div>
  );
}