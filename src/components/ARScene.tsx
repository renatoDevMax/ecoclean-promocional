"use client";

import { useEffect, useRef, useState } from "react";

export default function ARScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAR = async () => {
      try {
        setIsLoading(true);

        // Verifica se está em HTTPS
        if (
          typeof window !== "undefined" &&
          window.location.protocol !== "https:" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          throw new Error("AR requires HTTPS to access the camera.");
        }

        // Verifica suporte à câmera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Your browser doesn't support camera access.");
        }

        // Cria a cena AR diretamente no HTML
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <a-scene 
              embedded 
              arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
              renderer="logarithmicDepthBuffer: true;"
              vr-mode-ui="enabled: false"
            >
              <a-marker preset="hiro">
                <a-box position="0 0.5 0" material="color: red;"></a-box>
              </a-marker>
              <a-entity camera></a-entity>
            </a-scene>
          `;

          // Adiciona os scripts após criar a estrutura
          const aframeScript = document.createElement("script");
          aframeScript.src =
            "https://cdn.jsdelivr.net/gh/aframevr/aframe@1.4.0/dist/aframe-master.min.js";
          document.head.appendChild(aframeScript);

          await new Promise((resolve) => {
            aframeScript.onload = resolve;
          });

          const arjsScript = document.createElement("script");
          arjsScript.src =
            "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@master/aframe/build/aframe-ar.js";
          document.head.appendChild(arjsScript);

          await new Promise((resolve) => {
            arjsScript.onload = resolve;
          });

          // Ajusta o vídeo quando ele for criado
          const observer = new MutationObserver(() => {
            const video = document.getElementById("arjs-video");
            if (video) {
              Object.assign(video.style, {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
              });
              observer.disconnect();
            }
          });

          observer.observe(document.body, { childList: true, subtree: true });
        }

        setIsLoading(false);
      } catch (err) {
        console.error("AR Error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to initialize AR"
        );
        setIsLoading(false);
      }
    };

    loadAR();

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
        <div>
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white">
        <div className="text-center">
          <div className="mb-2">Loading AR...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    />
  );
}
