"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowBackIosNew, ArrowForwardIos } from "@mui/icons-material";

const slides = [
{ img: "/banner1.jpg", title: "Mega Sale", subtitle: "Up to 60% off" },
  { img: "/banner2.jpg", title: "New Arrivals", subtitle: "Trending Products" },
  { img: "/banner3.jpg", title: "Best Deals", subtitle: "Limited Time Offers" },
  { img: "/banner4.jpg", title: "Amazon Choice", subtitle: "Top Rated Items" },
  { img: "/banner5.jpg", title: "Fast Delivery", subtitle: "Doorstep in 24h" },
  { img: "/banner6.jpg", title: "Electronics Fest", subtitle: "Latest Gadgets" },
  { img: "/banner7.jpg", title: "Fashion Week", subtitle: "Top Brands Sale" },
  { img: "/banner8.jpg", title: "Home Essentials", subtitle: "Daily Needs" },
  { img: "/banner9.jpg", title: "Beauty Picks", subtitle: "Glow Everyday" },
  { img: "/banner10.jpg", title: "Clearance Sale", subtitle: "Last Chance Deals" },];

// Infinite clones
const extendedSlides = [
  slides[slides.length - 1],
  ...slides,
  slides[0],
];

const Middle = () => {
  const [index, setIndex] = useState(1);
  const [enableTransition, setEnableTransition] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const intervalRef = useRef(null);
  const startX = useRef(0);
  const startTime = useRef(0);

  /* ================= AUTOPLAY ================= */
  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      setIndex((p) => p + 1);
    }, 4000);
  };
  const stopAutoPlay = () => clearInterval(intervalRef.current);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, []);

  /* ================= INFINITE FIX ================= */
  useEffect(() => {
    if (index === extendedSlides.length - 1) {
      setTimeout(() => {
        setEnableTransition(false);
        setIndex(1);
      }, 700);
    }
    if (index === 0) {
      setTimeout(() => {
        setEnableTransition(false);
        setIndex(extendedSlides.length - 2);
      }, 700);
    }
  }, [index]);

  useEffect(() => {
    if (!enableTransition) requestAnimationFrame(() => setEnableTransition(true));
  }, [enableTransition]);

  /* ================= SWIPE ================= */
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startTime.current = Date.now();
    stopAutoPlay();
  };

  const onTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    const velocity = Math.abs(diff / (Date.now() - startTime.current));

    if (diff > 40 || velocity > 0.6) setIndex((p) => p + 1);
    if (diff < -40 || velocity > 0.6) setIndex((p) => p - 1);

    startAutoPlay();
  };

  const realIndex =
    index === 0
      ? slides.length - 1
      : index === extendedSlides.length - 1
      ? 0
      : index - 1;

  return (
    <div
      className="relative -mt-16 w-full h-[120px] sm:h-[120px] md:h-[120px] lg:h-[450px] overflow-hidden group"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-20" />
      )}

      {/* SLIDER */}
      <motion.div
        className="flex h-full"
        animate={{ x: `-${index * 100}%` }}
        transition={
          enableTransition
            ? { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
            : { duration: 0 }
        }
      >
        {extendedSlides.map((slide, i) => (
          <div key={i} className="relative min-w-full h-full">
            <motion.div
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image
                src={slide.img}
                alt={slide.title}
                fill
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className="object-cover"
              />
            </motion.div>

            {/* TEXT MICRO-INTERACTION */}
            <AnimatePresence>
              {realIndex === i - 1 && (
                <motion.div
                  key={slide.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-6 md:left-16 bottom-16 text-white"
                >
                  <h2 className="text-3xl md:text-5xl font-extrabold">
                    {slide.title}
                  </h2>
                  <p className="mt-2 text-lg">{slide.subtitle}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />

      {/* Arrows */}
      {[{ dir: -1, Icon: ArrowBackIosNew }, { dir: 1, Icon: ArrowForwardIos }].map(
        ({ dir, Icon }, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIndex((p) => p + dir)}
            className={`absolute ${
              dir === -1 ? "left-4" : "right-4"
            } top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100`}
          >
            <Icon fontSize="small" />
          </motion.button>
        )
      )}

      {/* DOTS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.3 }}
            onClick={() => setIndex(i + 1)}
            className={`w-2.5 h-2.5 rounded-full ${
              realIndex === i ? "bg-white" : "bg-white/40"
            }`}
            animate={{ scale: realIndex === i ? 1.4 : 1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Middle;
