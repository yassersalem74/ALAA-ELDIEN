import React from "react";

export default function HeroSection() {
  return (
    <section
      className="w-full bg-[#F8F9FC] pt-12 md:pt-20 pb-12"
      aria-label="Hero Section"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

        {/* ===== Layout Wrapper ===== */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-10 items-center">

          {/* ===== LEFT CONTENT ===== */}
          <article className="space-y-6 text-center md:text-left order-2 md:order-1">

            {/* Heading */}
            <header>
              <h1
                className="
                  font-['Roboto']
                  font-bold
                  text-[32px] sm:text-[40px] lg:text-[56px]
                  leading-tight
                  text-[#011C60]
                "
              >
                Everything You Need,{" "}
                <span className="text-[#EECE42]">
                  In One Place
                </span>
              </h1>
            </header>

            {/* Description */}
            <p
              className="
                text-[#5C6A8A]
                text-[16px] lg:text-[18px]
                max-w-xl
                mx-auto md:mx-0
                font-medium
              "
            >
              Services, shopping, and a trusted marketplace — designed
              exclusively for compound residents and businesses.
            </p>

            {/* Buttons ALWAYS ROW */}
            <nav
              className="
                flex flex-row
                gap-4
                justify-center md:justify-start
                pt-4
              "
              aria-label="Hero Actions"
            >
              {/* PRIMARY */}
              <button
                className="
                  bg-[#011C60]
                  text-white
                  rounded-[16px]
                  px-8 py-3
                  font-medium
                  transition-all duration-300
                  hover:bg-[linear-gradient(277.31deg,#CCD2DF_16.29%,#EECE42_96.02%)]
                  cursor-pointer
                "
              >
                Download App
              </button>

              {/* SECONDARY */}
              <button
                className="
                  border border-[#011C60]
                  text-[#011C60]
                  bg-white
                  rounded-[16px]
                  px-8 py-3
                  font-medium
                  transition-all duration-300
                  hover:bg-[#011C60]
                  hover:text-white
                  cursor-pointer
                "
              >
                Explore
              </button>
            </nav>

          </article>

          {/* ===== IMAGE ===== */}
          <figure
            className="
              flex justify-center md:justify-end
              order-1 md:order-2
            "
          >
            <img
              src="/public/Home-Page/hero-img.png"
              alt="Alaa Eldien App Preview"
              className="
                w-[360px] sm:w-[360px] md:w-[480px] lg:w-[605px]
                h-auto
                object-contain
              "
            />
          </figure>

        </div>
      </div>
    </section>
  );
}
