'use client';

import { FC, useState, useEffect } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

/* ======================================================
   Types
====================================================== */

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

type Position = { top: number; left: number };

type ImageData = {
  pos: Position;
  duration: number;
  delay: number;
  zIndex: number;
};

/* ======================================================
   Image positioning logic
====================================================== */

const positions: Position[] = [
  { top: 2.5, left: 2.5 },
  { top: 2.5, left: 52.5 },
  { top: 25, left: 25 },
  { top: 47.5, left: 40 },
];

let occupied: Position[] = [];
let zCounter = 1;

const getUniqueRandomPos = (prev?: Position): Position => {
  let available = positions.filter(
    (p) =>
      (prev ? p.top !== prev.top || p.left !== prev.left : true) &&
      !occupied.some((o) => o.top === p.top && o.left === p.left)
  );

  if (available.length === 0) {
    available = positions.filter(
      (p) => (prev ? p.top !== prev.top || p.left !== prev.left : true)
    );
  }

  const next = available[Math.floor(Math.random() * available.length)];

  occupied = [
    ...occupied.filter(
      (o) => !(prev && o.top === prev.top && o.left === prev.left)
    ),
    next,
  ];

  return next;
};

const getRandomDuration = () => 6 + Math.random() * 4;
const getRandomDelay = () => Math.random() * 5;

/* ======================================================
   Background Image Component
====================================================== */

type BackgroundImageProps = {
  item: Content.HeroSlice["primary"]["images"][number];
  data: ImageData;
};

const BackgroundImage: FC<BackgroundImageProps> = ({ item, data }) => {
  const [pos, setPos] = useState<Position>(data.pos);
  const [zIndex, setZIndex] = useState<number>(data.zIndex);

  useEffect(() => {
    setPos(data.pos);
    setZIndex(data.zIndex);
  }, [data.pos, data.zIndex]);

  return (
    <div
      className="bg-wrapper"
      style={{
        top: `${pos.top}%`,
        left: `${pos.left}%`,
        zIndex,
      }}
    >
      <div
        className="bg-image"
        style={{
          "--duration": `${data.duration}s`,
          "--delay": `${data.delay}s`,
        } as React.CSSProperties}
        onAnimationIteration={() => {
          setPos((prev) => getUniqueRandomPos(prev));
          setZIndex(++zCounter);
        }}
      >
        <PrismicNextImage field={item.image} />
      </div>
    </div>
  );
};

/* ======================================================
   EXACT COLOR + LETTER MAPPING
====================================================== */

const COLORS = [
  "rgb(255,106,0)",   // color1 (orange)
  "rgb(38,0,255)",    // color2 (blue)
  "rgb(255,156,130)", // color3 (peach)
  "rgb(253,255,1)",   // color4 (yellow)
];

// EXACT 8-step color pattern
const COLOR_SEQUENCE = [
  COLORS[0], // 0 → color1
  COLORS[1], // 1 → color2
  COLORS[2], // 2 → color3
  COLORS[3], // 3 → color4
  COLORS[1], // 4 → color2
  COLORS[2], // 5 → color3
  COLORS[3], // 6 → color4
  COLORS[1], // 7 → color2
];

// Letters always repeat N E S T
const LETTER_SEQUENCE = ["N", "E", "S", "T"];

/* ======================================================
   Hero Component
====================================================== */

const Hero: FC<HeroProps> = ({ slice }) => {
  const [imagesData, setImagesData] = useState<ImageData[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  const [letter, setLetter] = useState("N");
  const [letterColor, setLetterColor] = useState(COLORS[0]);

  /* -----------------------------
     Init background images
  ------------------------------ */
  useEffect(() => {
    occupied = [];
    zCounter = 1;

    const data = slice.primary.images.map(() => ({
      pos: getUniqueRandomPos(),
      duration: getRandomDuration(),
      delay: getRandomDelay(),
      zIndex: zCounter++,
    }));

    setImagesData(data);
  }, [slice.primary.images]);

  /* -----------------------------
     MASTER SECTION OBSERVER
  ------------------------------ */
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section")
    );

    let lastStableIndex = 0;
    let stabilityTimer: NodeJS.Timeout | null = null;

    const applySectionChange = (index: number) => {
      if (index === lastStableIndex) return;

      lastStableIndex = index;

      /** COLOR — strict sequence */
      if (index < COLOR_SEQUENCE.length) {
        setLetterColor(COLOR_SEQUENCE[index]);
      } else {
        const fallback = ((index - 1) % 3) + 1;
        setLetterColor(COLORS[fallback]);
      }

      /** LETTER — strict N E S T repeat */
      const letterIndex = index % LETTER_SEQUENCE.length;
      setLetter(LETTER_SEQUENCE[letterIndex]);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            // Highest ratio first
            if (b.intersectionRatio !== a.intersectionRatio)
              return b.intersectionRatio - a.intersectionRatio;

            // On tie → pick the one that appears later (downwards scrolling)
            return (
              sections.indexOf(a.target as HTMLElement) -
              sections.indexOf(b.target as HTMLElement)
            );
          })[0];

        if (!visible) return;

        const index = sections.indexOf(visible.target as HTMLElement);
        if (index === -1) return;

        // debounce for stability (prevents flicker)
        if (stabilityTimer) clearTimeout(stabilityTimer);

        stabilityTimer = setTimeout(() => {
          applySectionChange(index);
        }, 50); // tuneable: 30–80ms is ideal
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      if (stabilityTimer) clearTimeout(stabilityTimer);
      observer.disconnect();
    };
  }, []);



  /* ====================================================== */

  return (
    <section
      className="hero"
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
    >
      <h1 style={{ color: letterColor }}>{letter}</h1>

      <div className="intro">
        <PrismicRichText field={slice.primary.text} />
      </div>

      <div className="background-images">
        {imagesData.map((data, i) => (
          <BackgroundImage
            key={i}
            item={slice.primary.images[i]}
            data={data}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
