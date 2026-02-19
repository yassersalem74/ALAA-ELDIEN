import React from "react";

export default function WhySection() {
  const cards = [
    {
      title: "All-in-One Platform",
      desc: "Access services, shop products, and explore the marketplace",
    },
    {
      title: "Trusted & Reliable",
      desc: "Work with verified service providers and trusted sellers you can rely on.",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white mt-12">
      <div className="px-8 lg:px-20 mx-auto">

        {/* ===== 3 COLUMN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          {/* ===== IMAGE (1 COL ON LG, FIRST ON MOBILE) ===== */}
          <div className="order-2 lg:col-span-1 flex justify-center lg:justify-end">
            <img
              src="/whyoverview.png"
              alt="Why Alaa El Din"
              className="w-full max-w-[420px] lg:max-w-[480px] object-contain"
            />
          </div>

          {/* ===== TEXT SIDE (2 COLS ON LG) ===== */}
          <div className="order-1 lg:col-span-2">

            {/* ===== TITLE ===== */}
            <h2 className="font-bold text-[34px] md:text-[42px] lg:text-[48px] leading-tight mb-6">
              <span className="text-[#011C60]">Why </span>
              <span className="text-[#EECE42]">Alaa El Din ?</span>
            </h2>

            {/* ===== PARAGRAPHS ===== */}
            <p className="text-[#99A4BF] text-[18px] md:text-[20px] lg:text-[22px] font-medium leading-relaxed mb-6">
              Alaa El Din represents the idea of one smart solution that makes life easier.
            </p>

            <p className="text-[#99A4BF] text-[18px] md:text-[20px] lg:text-[22px] font-medium leading-relaxed mb-8">
              Just like a single wish could solve many problems, this platform was inspired by simplicity — one place that brings everything together without effort.
            </p>

            {/* ===== CARDS ===== */}
            <div className="grid sm:grid-cols-2 gap-5">
              {cards.map((c, i) => (
                <div
                  key={i}
                  className="
                    group
                    bg-white
                    rounded-[16px]
                    p-5
                    border border-[#E6E8EF59]
                    shadow-[0px_4px_16px_0px_#BEC6DE80]
                    transition-all duration-300
                    hover:bg-[#EECE42]
                    hover:-translate-y-1
                    hover:shadow-xl
                    cursor-pointer
                  "
                >
                  <h4 className="
                      text-[#344980]
                      font-bold
                      text-[20px]
                      mb-2
                      transition
                      group-hover:text-[#011C60]
                  ">
                    {c.title}
                  </h4>

                  <p className="
                      text-[#808DAF]
                      text-[16px]
                      leading-relaxed
                      transition
                      group-hover:text-[#011C60]
                  ">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
