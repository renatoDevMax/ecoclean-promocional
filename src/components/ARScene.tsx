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

        // Carrega A-Frame
        const aframeScript = document.createElement("script");
        aframeScript.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
        await new Promise((resolve, reject) => {
          aframeScript.onload = resolve;
          aframeScript.onerror = () =>
            reject(new Error("Failed to load A-Frame"));
          document.head.appendChild(aframeScript);
        });

        // Carrega AR.js
        const arjsScript = document.createElement("script");
        arjsScript.src =
          "https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js";
        await new Promise((resolve, reject) => {
          arjsScript.onload = resolve;
          arjsScript.onerror = () => reject(new Error("Failed to load AR.js"));
          document.head.appendChild(arjsScript);
        });

        // Cria a cena AR
        if (containerRef.current) {
          const scene = document.createElement("a-scene");
          scene.setAttribute("embedded", "");
          scene.setAttribute(
            "arjs",
            "sourceType: webcam; debugUIEnabled: false;"
          );
          scene.setAttribute("vr-mode-ui", "enabled: false");

          // Adiciona o marcador e o cubo
          const marker = document.createElement("a-marker");
          marker.setAttribute("preset", "hiro");

          const box = document.createElement("a-box");
          box.setAttribute("position", "0 0.5 0");
          box.setAttribute("material", "color: red;");

          marker.appendChild(box);
          scene.appendChild(marker);

          const camera = document.createElement("a-entity");
          camera.setAttribute("camera", "");

          scene.appendChild(camera);
          containerRef.current.appendChild(scene);

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
        setError(
          err instanceof Error ? err.message : "Failed to initialize AR"
        );
        setIsLoading(false);
      }
    };

    loadAR();

    // Cleanup
    return () => {
      const scene = document.querySelector("a-scene");
      if (scene) {
        scene.remove();
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
