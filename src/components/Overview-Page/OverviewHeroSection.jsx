import React from "react";

export default function OverviewHeroSection() {
  return (
    <section
      className="
        relative
        md:bg-cover
       
        bg-no-repeat
      "
      style={{ backgroundImage: "url('/overview-hero-cover.png')" }}
    >
      <div className="px-8 lg:px-20 py-16 lg:py-24 mx-auto">

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">

          {/* ===== LEFT TEXT ===== */}
          <div className="text-center lg:text-left">
            <h2
              className="
                text-[#4D6090]
                font-bold
                text-[28px] md:text-[32px] lg:text-[36px]
                leading-[42px] md:leading-[48px] lg:leading-[56px]
              "
            >
              Designed for Your Needs. Built
              <br className="hidden md:block" />
              for Your Growth.
            </h2>
          </div>

          {/* ===== RIGHT IMAGE (HIDDEN ON MOBILE) ===== */}
          <div className="hidden lg:flex justify-center ">
            <img
              src="/overview-mobile-hero.png"
              alt="Overview Illustration"
              className="
                w-full
                max-w-[480px]
                object-contain
              "
            />
          </div>

        </div>
      </div>
    </section>
  );
}
