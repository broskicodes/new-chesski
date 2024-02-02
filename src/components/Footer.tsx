import Link from "next/link";

export function Footer() {

  return (
    <div className="absolute bottom-0 left-0 w-screen h-12 bg-[#343338] flex flex-col justify-center">
      <p className="text-white pl-4 custom-text">Email support at: <Link href="mailto:braeden@chesski.lol" className="underline">braeden@chesski.lol</Link></p>
    </div>
  );
}