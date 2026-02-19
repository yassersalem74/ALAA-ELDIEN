import React, { useEffect, useState } from "react";

export default function AboutSection() {
  // ===== Images Array =====
  const images = ["/home-about-section.png", "/home-about-section2.png"];

  const [currentIndex, setCurrentIndex] = useState(0);

  // ===== Interval Loop =====
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className=" mx-auto px-8 lg:px-20">
        {/* ===== TOP TEXT ===== */}
        <header className="text-center mx-auto mb-12 space-y-4">
          <h3 className="font-['Roboto'] font-bold text-[22px] md:text-[28px] lg:text-[32px] text-[#EECE42]">
            About Our Platform
          </h3>

          <h2 className="font-['Roboto'] font-bold text-[30px] md:text-[40px] lg:text-[48px]">
            <span className="text-[#EECE42]">We Simplify </span>
            <span className="text-[#011C60]">Everyday Life</span>
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-3xl mx-auto font-medium">
            Our platform is built to remove complexity and make accessing
            services and shopping easier, faster, and more reliable.
          </p>
        </header>

        {/* ===== CONTENT ===== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* ===== IMAGE SLIDER ===== */}
          <figure className="w-full max-w-[565px] h-[376px] overflow-hidden rounded-[16px] flex justify-center">
            <img
              src={images[currentIndex]}
              className="w-full h-full object-cover"
            />
          </figure>

          {/* ===== TEXT + BUTTON ===== */}
          <article className="space-y-6">
            <div className="space-y-4">
              <p className="font-['Roboto'] font-medium text-[16px] md:text-[18px] lg:text-[20px] text-[#6777A0] leading-relaxed">
                We built our platform to make everyday life easier and more
                organized.
              </p>

              <p className="font-['Roboto'] font-medium text-[16px] md:text-[18px] lg:text-[20px] text-[#6777A0] leading-relaxed">
                Instead of switching between multiple apps and websites, we
                bring everything you need into one simple, reliable experience.
                From professional services to a trusted marketplace and an
                integrated online store, our goal is to remove complexity and
                help you get things done with confidence and ease.
              </p>
            </div>

            {/* ===== BUTTON ===== */}
            <button
              className="
                inline-flex items-center gap-2
                bg-[#011C60]
                text-white
                px-8 py-3
                rounded-[16px]
                font-medium
                transition-all duration-300
                cursor-pointer
                hover:bg-[linear-gradient(277.31deg,#CCD2DF_16.29%,#EECE42_96.02%)]
              "
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download App
            </button>
          </article>
        </div>
      </div>
    </section>
  );
}
