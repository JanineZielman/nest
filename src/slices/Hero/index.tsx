'use client'

import { FC, useState, useEffect } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

type Position = { top: number; left: number };

type ImageData = {
  pos: Position;
  duration: number;
  delay: number;
  zIndex: number;
};

// Available positions
const positions: Position[] = [
  { top: 2.5, left: 2.5 },     // top-left
  { top: 2.5, left: 52.5 },    // top-right
  { top: 25, left: 25 },       // center-ish
  { top: 47.5, left: 40 },     // lower-right
];

// Track which positions are in use
let occupied: Position[] = [];

// Used to control stacking order
let zCounter = 1;

// Pick a position that is:
// - not the same as previous
// - not currently occupied
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
    ...occupied.filter((o) => !(prev && o.top === prev.top && o.left === prev.left)),
    next,
  ];

  return next;
};

const getRandomDuration = () => 6 + Math.random() * 4;
const getRandomDelay = () => Math.random() * 5;

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
          setZIndex(++zCounter); // bring moved image to top ✅
        }}
      >
        <PrismicNextImage field={item.image} />
      </div>
    </div>
  );
};

const Hero: FC<HeroProps> = ({ slice }) => {
  const [imagesData, setImagesData] = useState<ImageData[]>([]);
  const [letter, setLetter] = useState("N");
  const [letterColor, setLetterColor] = useState<string>("rgb(255,106,-0)");

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

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const screenHeight = window.innerHeight;
      const scrollFraction = scrollY / screenHeight;

      if (scrollFraction < 1) {
        setLetter("N");
        setLetterColor("rgb(255,106,-0)");
      } else if (scrollFraction < 2) {
        setLetter("E");
        setLetterColor("rgb(38,0,255)");
      } else if (scrollFraction < 3) {
        setLetter("S");
        setLetterColor("rgb(255,156,130)");
      } else {
        setLetter("T");
        setLetterColor("rgb(253,255,1)");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero" data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
      <h1 style={{ color: letterColor }}>{letter}</h1>

      <div className="intro">
        <PrismicRichText field={slice.primary.text} />
      </div>

      <div className="background-images">
        {imagesData.map((data, i) => (
          <BackgroundImage key={i} item={slice.primary.images[i]} data={data} />
        ))}
      </div>
    </section>
  );
};

export default Hero;
