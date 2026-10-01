"use client";
import { motion, useReducedMotion } from "motion/react";
import { useJarvisStore } from "@/lib/store/jarvis-store";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useId } from "react";
const strands = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * Math.PI) / 32;
  return (
    Array.from({ length: 121 }, (_, j) => {
      const t = (j * Math.PI * 2) / 120;
      const wave = 1 + 0.025 * Math.sin(t * 7 + i * 0.6);
      const x = 112 * Math.cos(t) * wave;
      const y = 112 * Math.sin(t) * Math.sin(angle) * wave;
      const twist = 0.42 + 0.18 * Math.sin(t * 2);
      return `${j === 0 ? "M" : "L"}${(200 + x * Math.cos(twist) - y * Math.sin(twist)).toFixed(2)},${(200 + x * Math.sin(twist) + y * Math.cos(twist)).toFixed(2)}`;
    }).join(" ") + " Z"
  );
});
export function JarvisOrb() {
  const state = useJarvisStore((s) => s.state);
  const level = useJarvisStore((s) => s.audioLevel);
  const systemReduced = useReducedMotion();
  const reduced = useSettingsStore((s) => s.reducedMotion) || systemReduced;
  const id = useId().replaceAll(":", "");
  const active = ["thinking", "speaking", "executing", "listening"].includes(
    state,
  );
  return (
    <div
      className={`orb-container orb-${state}`}
      role="img"
      aria-label={`JARVIS is ${state.replaceAll("_", " ")}`}
    >
      <div className="orb-aura" />
      <svg
        className="orb-svg"
        viewBox="0 0 400 400"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-glow`}>
            <stop stopColor="currentColor" stopOpacity=".23" />
            <stop offset=".6" stopColor="currentColor" stopOpacity=".06" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-sphere`} cx=".35" cy=".28" r=".75">
            <stop stopColor="currentColor" stopOpacity=".1" />
            <stop offset=".65" stopColor="currentColor" stopOpacity=".01" />
            <stop offset="1" stopColor="currentColor" stopOpacity=".16" />
          </radialGradient>
          <filter id={`${id}-blur`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <circle cx="200" cy="200" r="190" fill={`url(#${id}-glow)`} />
        <circle
          cx="200"
          cy="200"
          r="165"
          stroke="currentColor"
          strokeOpacity=".09"
          strokeWidth=".6"
        />
        {Array.from({ length: 72 }, (_, i) => (
          <line
            key={i}
            x1="200"
            y1={i % 6 === 0 ? 29 : 34}
            x2="200"
            y2="38"
            stroke="currentColor"
            strokeOpacity={i % 6 === 0 ? 0.42 : 0.17}
            strokeWidth="1"
            transform={`rotate(${i * 5} 200 200)`}
          />
        ))}
        <circle
          cx="200"
          cy="200"
          r="149"
          stroke="currentColor"
          strokeOpacity=".16"
          strokeWidth=".7"
          strokeDasharray="2 7"
        />
        <motion.g
          animate={reduced ? {} : { rotate: active ? 360 : 20 }}
          transition={{
            duration: active ? 14 : 38,
            ease: "linear",
            repeat: Infinity,
            repeatType: active ? "loop" : "reverse",
          }}
          style={{ transformOrigin: "200px 200px" }}
        >
          <circle
            cx="200"
            cy="200"
            r="137"
            stroke="currentColor"
            strokeOpacity=".5"
            strokeWidth="1.2"
            strokeDasharray="75 160 23 172"
          />
          <circle cx="200" cy="63" r="2.5" fill="currentColor" />
        </motion.g>
        <motion.g
          animate={
            reduced
              ? {}
              : {
                  scale:
                    state === "listening"
                      ? 1 + level * 0.09
                      : active
                        ? [1, 1.035, 1]
                        : [1, 1.012, 1],
                }
          }
          transition={{
            duration: state === "listening" ? 0.25 : active ? 2 : 6,
            repeat: state === "listening" ? 0 : Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "200px 200px" }}
        >
          <circle
            cx="200"
            cy="200"
            r="113"
            fill={`url(#${id}-sphere)`}
            stroke="currentColor"
            strokeOpacity=".25"
          />
          <g className="orb-strands">
            {strands.map((d, i) => (
              <path
                key={i}
                d={d}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 0.9 : 0.55}
                strokeOpacity={i % 5 === 0 ? 0.6 : 0.24}
              />
            ))}
          </g>
          <ellipse
            cx="200"
            cy="200"
            rx="112"
            ry="31"
            transform="rotate(-28 200 200)"
            stroke="currentColor"
            strokeOpacity=".3"
          />
          <circle
            cx="200"
            cy="200"
            r="110"
            stroke="currentColor"
            strokeOpacity=".22"
            strokeWidth="3"
            filter={`url(#${id}-blur)`}
          />
        </motion.g>
        <path
          d="M14 195v10m-5-5h10M386 195v10m-5-5h10"
          stroke="currentColor"
          strokeOpacity=".35"
        />
      </svg>
      <span className="orb-coordinate coordinate-left">J.V / 01</span>
      <span className="orb-coordinate coordinate-right">NEURAL CORE</span>
    </div>
  );
}
