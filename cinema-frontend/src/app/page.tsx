"use client"

import { useEffect, useState } from "react";

export default function Home() {
  const [helloText, setHelloText] = useState("Fetching api text...");
  useEffect(() => {
    fetch("http://localhost:8080/api/movies?title=Wild and Woolly")
      .then(res => res.json())
      .then(data => setHelloText(JSON.stringify(data, null, 2)))
      .catch(err => console.error(err))
  })

  return (
    <div className="flex font-sans items-center justify-items-center">
      <pre className="text-xl">{helloText}</pre>
    </div>
  );
}
