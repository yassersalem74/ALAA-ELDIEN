import React from "react";

export default function ReadySection() {
  return (
    <section className="py-16 mt-16 bg-[#E9ECF4]">
      <div className="px-8 lg:px-20 mx-auto text-center">
        {/* ===== TITLE ===== */}
        <h2
          className="
            font-bold
            text-[28px] md:text-[32px] lg:text-[36px]
            text-[#011C60]
            mb-6
          "
        >
          Ready to Start Your journey ?
        </h2>

        {/* ===== SUBTITLE ===== */}
        <p
          className="
            text-[#808DAF]
            text-[16px] md:text-[18px] lg:text-[20px]
            font-medium
            max-w-2xl
            mx-auto
            leading-relaxed
            mb-10
          "
        >
          join thousands of others who have simplified their digital lives . the
          future of connection is just one click away .
        </p>

        {/* ===== BUTTONS ===== */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          {/* PRIMARY BUTTON */}
          <button
            className="
              px-8 py-4
              rounded-[16px]
              font-semibold
              text-white
              bg-[#011C60]
              transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]

              hover:bg-[linear-gradient(272.92deg,#CCD2DF_6.27%,#EECE42_95.75%)]
              hover:text-white
              hover:-translate-y-1
              hover:shadow-[0px_8px_24px_rgba(1,28,96,0.25)]
                cursor-pointer
              active:scale-95
            "
          >
            Download App
          </button>

          {/* SECONDARY BUTTON */}
          <button
            className="
              px-8 py-4
              rounded-[16px]
              font-semibold
              border border-[#011C60]
              text-[#011C60]
              bg-transparent
              transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]
  cursor-pointer
              hover:bg-[#011C60]
              hover:text-white
              hover:-translate-y-1
              hover:shadow-[0px_8px_24px_rgba(1,28,96,0.15)]

              active:scale-95
            "
          >
            Explore platform
          </button>
        </div>
      </div>
    </section>
  );
}
