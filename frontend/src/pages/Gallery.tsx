import { i } from "framer-motion/client";
import img1 from "../assets/gallery_img/gal1-min.jpg";
import img2 from "../assets/gallery_img/gal2-min.jpg";
import img3 from "../assets/gallery_img/gal3-min.jpg";
import img4 from "../assets/gallery_img/gal4-min.jpg";
import img5 from "../assets/gallery_img/gal5-min.jpg";
import img6 from "../assets/gallery_img/gal6-min.jpg";
import img7 from "../assets/gallery_img/gal7-min.jpg";
import img8 from "../assets/gallery_img/gal8-min.jpg";
import img9 from "../assets/gallery_img/gal9-min.jpg";
import img10 from "../assets/gallery_img/gal10-min.jpg";
import img11 from "../assets/gallery_img/gal11-min.jpg";
import img12 from "../assets/gallery_img/gal12-min.jpg";






const Gallery = () => {
  return (
    <div className="p-10 grid place-content-center mt-20 ">
      <h1 className="text-4xl font-semibold text-center font-Playfair tracking-wider mb-8">
        Stunning Travel Destinations
      </h1>

      <div className="mx-2 md:mx-10">
        <span className="bg-green-500 p-1 rounded-full font-bold font-Playfair">
          Collection of Memories
        </span>
        <div className="text-xl my-3 tracking-wider font-Playfair">
          Visit our collection of stunning travel destinations and create unforgettable memories.
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4  md:p-10 max-w-7xl">
        <div className="grid gap-4">
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img1}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img2}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img3}
              alt=""
            />
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img4}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img5}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img6}
              alt=""
            />
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img7}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img8}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img9}
              alt=""
            />
          </div>
        </div>
        <div className="grid gap-4">
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img10}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img11}
              alt=""
            />
          </div>
          <div>
            <img
              className="h-auto max-w-full rounded-lg transform transition-transform duration-300 hover:scale-105"
              src={img12}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
