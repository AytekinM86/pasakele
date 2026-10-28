"use client";

import dynamic from "next/dynamic";

// The app keeps everything in localStorage and uses browser speech APIs, so it renders only in the browser.
const Pasakele = dynamic(() => import("./Pasakele"), { ssr: false });

export default function ClientApp() {
  return <Pasakele />;
}
