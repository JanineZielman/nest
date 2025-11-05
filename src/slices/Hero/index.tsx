'use client'

import { FC, useState, useEffect } from "react";
import { Content } from "@prismicio/client";
import { PrismicRichText, SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";

export type HeroProps = SliceComponentProps<Content.HeroSlice>;

type ImageData = {
  pos: { top: number; left: number };
  duration: number;
  delay: number;
};

const getRandomPos = () => ({
  top: Math.random() * 80 + 10,
  left: Math.random() * 80 + 10,
});

const getRandomDuration = () => 6 + Math.random() * 4; // 6–10s
const getRandomDelay = () => Math.random() * 5; // 0–5s

// 👇 Strongly typed child component
type BackgroundImageProps = {
  item: Content.HeroSlice["primary"]["images"][number];
  data: ImageData;
};

const BackgroundImage: FC<BackgroundImageProps> = ({ item, data }) => {
  const [pos, setPos] = useState(data.pos);


  useEffect(() => {
    setPos(data.pos); // initialize from parent
  }, [data.pos]);

  return (
    <div
      className="bg-wrapper"
      style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
    >
      <div
        className="bg-image"
        style={{
          "--duration": `${data.duration}s`,
          "--delay": `${data.delay}s`,
        } as React.CSSProperties}
        onAnimationIteration={() => {
          setPos(getRandomPos());
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
    const data = slice.primary.images.map(() => ({
      pos: getRandomPos(),
      duration: getRandomDuration(),
      delay: getRandomDelay(),
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
      setLetterColor("rgb(255,106,-0)"); // red
    } else if (scrollFraction < 2) {
      setLetter("E");
      setLetterColor("rgb(38,0,255)"); // blue
    } else if (scrollFraction < 3) {
      setLetter("S");
      setLetterColor("rgb(255,156,130)"); // green
    } else {
      setLetter("T");
      setLetterColor("rgb(253,255,1)"); // yellow
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hero"
    >
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
