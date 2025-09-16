"use client"

import { useEffect, useState } from "react";

export default function Home() {
  const [helloText, setHelloText] = useState("Fetching api text...");
  useEffect(() => {
    fetch("http://localhost:8080/api/users/findall")
      .then(res => res.text())
      .then(data => setHelloText(data))
      .catch(err => console.error(err))
  })

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <p className="text-5xl">{helloText}</p>
    </div>
  );
}
