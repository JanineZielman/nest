import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";

/**
 * Props for `Video`.
 */
export type VideoProps = SliceComponentProps<Content.VideoSlice>;

/**
 * Component for "Video" Slices.
 */
const Video: FC<VideoProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="video-section"
    >
      <div
        dangerouslySetInnerHTML={{
          __html: slice.primary.embed.html,
        }}
      />
      <p>{slice.primary.caption}</p>
    </section>
  );
};

export default Video;
