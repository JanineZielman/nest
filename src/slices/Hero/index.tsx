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
  top: Math.random() * 90,
  left: Math.random() * 90,
});

const getRandomDuration = () => 6 + Math.random() * 4; // 6–10s
const getRandomDelay = () => Math.random() * 5; // 0–5s

const Hero: FC<HeroProps> = ({ slice }) => {
  const [imagesData, setImagesData] = useState<ImageData[]>([]);

  useEffect(() => {
    // Initialize positions, durations, delays once
    const data = slice.primary.images.map(() => ({
      pos: getRandomPos(),
      duration: getRandomDuration(),
      delay: getRandomDelay(),
    }));
    setImagesData(data);
  }, [slice.primary.images]);

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hero"
    >
      <h1>N</h1>
      <div className="intro">
        <PrismicRichText field={slice.primary.text}/>
      </div>
      <div className="background-images">
        {slice.primary.images.map((item, i) => {
          const [pos, setPos] = useState({ top: 0, left: 0 });

          useEffect(() => {
            // Set initial position from imagesData
            if (imagesData[i]) setPos(imagesData[i].pos);
          }, [imagesData, i]);

          if (!imagesData[i]) return null; // wait for initialization

          return (
            <div
              key={i}
              className="bg-wrapper"
              style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
            >
              <div
                className="bg-image"
                style={{
                  "--duration": `${imagesData[i].duration}s`,
                  "--delay": `${imagesData[i].delay}s`,
                } as React.CSSProperties}
                onAnimationIteration={() => {
                  // Randomize position each time fade finishes
                  setPos(getRandomPos());
                }}
              >
                <PrismicNextImage field={item.image} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Hero;
