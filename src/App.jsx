import React, { useEffect } from "react";
import gsap from "gsap";
import Posts from "./components/Posts";

const App = () => {
  useEffect(() => {
    const cursor = document.querySelector(".custom-cursor");

    document.addEventListener("mousemove", (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
    });

    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        gsap.to(cursor, {
          scale: 2,
          backgroundColor: "#FF5733",
          duration: 0.2,
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: "#22c55e",
          duration: 0.2,
        });
      });
    });
  }, []);

  return (
    <div className="relative">
      {/* Sleek custom cursor */}
      <div className="custom-cursor fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-50"></div>

      {/* Your main content */}
      <Posts />
    </div>
  );
};

export default App;
