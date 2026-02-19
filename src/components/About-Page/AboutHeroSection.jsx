import React from "react";

export default function AboutHeroSection() {
  const cards = [
    {
      title: "All-in-One Platform",
      desc: "Access services, shop products, and explore the marketplace",
    },
    {
      title: "Trusted & Reliable",
      desc: "Work with verified service providers and trusted sellers you can rely on.",
    },
    {
      title: "Fast & Convenient",
      desc: "Save time by finding everything you need in just a few taps.",
    },
    {
      title: "Built for Users Businesses",
      desc: "A seamless experience for users and a powerful tool to grow.",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="px-8 lg:px-20 mx-auto">

        {/* ===== 3 COLUMN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          {/* ===== IMAGE (1 COL ON LG, FIRST ON MOBILE) ===== */}
          <div className="order-1 lg:order-2 lg:col-span-1 flex justify-center lg:justify-end">
            <img
              src="/about-heroGroup.png"
              alt="Platform preview"
              className="w-full max-w-[420px] lg:max-w-[480px] object-contain"
            />
          </div>

          {/* ===== TEXT SIDE (2 COLS ON LG) ===== */}
          <div className="order-2 lg:order-1 lg:col-span-2">

            {/* Title */}
            <h2 className="font-bold text-[34px] md:text-[42px] lg:text-[48px] leading-tight mb-6">
              <span className="text-[#011C60]">About </span>
              <span className="text-[#EECE42]">
                What We Do & How It Helps You
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-[#99A4BF] text-[18px] md:text-[20px] lg:text-[22px] font-medium leading-relaxed mb-8">
              We built this app to simplify your daily life by bringing
              services, shopping, and a trusted marketplace into one
              easy-to-use platform.
            </p>

            {/* Cards */}
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

            {/* Bottom text */}
            <p className="text-[#99A4BF] text-[18px] md:text-[20px] leading-relaxed mt-8">
              Whether you’re looking to book a service, buy a product, or
              grow your business, our app connects you with the right
              solutions in a simple, secure, and smart way.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
