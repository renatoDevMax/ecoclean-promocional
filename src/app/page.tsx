"use client";

import dynamic from "next/dynamic";

// Componente AR carregado dinamicamente apenas no cliente
const ARScene = dynamic(() => import("../components/ARScene"), {
  ssr: false,
});

export default function Home() {
  return <ARScene />;
}
