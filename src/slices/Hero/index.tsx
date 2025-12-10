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
   Image positioning logic (unchanged)
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
   Background Image
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
   Hero Logic
====================================================== */

const FIRST_SECTION_COLOR = "rgb(255,106,0)"; // orange

const CYCLING_COLORS = [
  "rgb(38,0,255)",    // blue
  "rgb(255,156,130)", // peach
  "rgb(253,255,1)",   // yellow
];

const LETTERS = ["N", "E", "S", "T"];

/* ======================================================
   Hero Component
====================================================== */

const Hero: FC<HeroProps> = ({ slice }) => {
  const [imagesData, setImagesData] = useState<ImageData[]>([]);
  const [activeSection, setActiveSection] = useState(0);
  const [letter, setLetter] = useState(LETTERS[0]);
  const [letterColor, setLetterColor] = useState(FIRST_SECTION_COLOR);

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
     Section observer (MASTER CLOCK)
  ------------------------------ */
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = sections.indexOf(entry.target as HTMLElement);
          if (index === -1) return;

          setActiveSection(index);

          // color
          if (index === 0) {
            setLetterColor(FIRST_SECTION_COLOR);
          } else {
            const cycleIndex =
              (index - 1) % CYCLING_COLORS.length;
            setLetterColor(CYCLING_COLORS[cycleIndex]);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  /* -----------------------------
     Letter synced to section
  ------------------------------ */
  useEffect(() => {
    const letterIndex = activeSection % LETTERS.length;
    setLetter(LETTERS[letterIndex]);
  }, [activeSection]);

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
