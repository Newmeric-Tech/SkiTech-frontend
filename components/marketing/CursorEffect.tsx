"use client";

import { useEffect } from "react";

export function CursorEffect() {
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const glowElement = document.getElementById("cursor-glow");
    const dotElement = document.getElementById("cursor-dot");
    const ringElement = document.getElementById("cursor-ring");
    if (!glowElement || !dotElement || !ringElement) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let revealed = false;
    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!revealed) {
        ringX = mouseX;
        ringY = mouseY;
        glowElement.style.opacity = "1";
        dotElement.style.opacity = "0.85";
        ringElement.style.opacity = "1";
        revealed = true;
      }

      glowElement.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
      dotElement.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ringElement.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
      animationFrame = requestAnimationFrame(animateRing);
    };

    document.addEventListener("mousemove", handleMouseMove);
    animationFrame = requestAnimationFrame(animateRing);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <div id="cursor-glow" aria-hidden="true" />
      <div id="cursor-ring" aria-hidden="true" />
      <div id="cursor-dot" aria-hidden="true" />
    </>
  );
}