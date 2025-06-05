// src/components/Header.js
"use client";
import Image from "next/image";
import Link from "next/link";
import urljoin from "url-join";
import ThemeToggle from "./ThemeToggle";
import nextConfig from "../next.config";
import '../app/globals.css'

const basePath = nextConfig.basePath || "";

export default function Header() {
  return (
    <div
      id="header"
      className="fixed md:relative w-full z-[100] flex items-center justify-between flex-wrap gap-2 px-2 md:px-8 py-4 bg-header text-text shadow-md"
    >
      <div className="flex items-center gap-2">
        <Image
          src={urljoin(basePath, "/assistant.svg")}
          height={50}
          width={50}
          alt="Logotype of a robot as a speach bubble, with a mortarboard on top"
        />
        <Link href={"/"}>
          <h6 className="text-2xl md:text-3xl font-semibold text-white">Open GPT</h6>
        </Link>
      </div>
      <ThemeToggle />
    </div>
  );
}
