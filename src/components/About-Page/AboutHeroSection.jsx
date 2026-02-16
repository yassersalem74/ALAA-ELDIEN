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
      <div className="max-w-[1200px] mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ===== LEFT SIDE ===== */}
          <div>

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
                    bg-white
                    rounded-[16px]
                    p-5
                    shadow-[0px_4px_16px_0px_#BEC6DE80]
                    border border-[#E6E8EF59]
                    hover:shadow-xl
                    transition
                  "
                >
                  <h4 className="text-[#344980] font-bold text-[20px] mb-2">
                    {c.title}
                  </h4>

                  <p className="text-[#808DAF] text-[16px] leading-relaxed">
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

          {/* ===== RIGHT SIDE (FIXED) ===== */}
          <div className="relative h-[420px] w-full max-w-[420px] mx-auto">

            {/* Image 1 - Top Left */}
            <img
              src="/about-hero-1.png"
              alt=""
              className="
                absolute
                top-0 left-0
                w-[260px] md:w-[300px]
                rounded-[16px]
                shadow-lg
              "
            />

            {/* Image 2 - Bottom Right */}
            <img
              src="/about-hero-2.png"
              alt=""
              className="
                absolute
                bottom-0 right-0
                w-[260px] md:w-[320px]
                rounded-[16px]
                shadow-xl
              "
            />

          </div>

        </div>
      </div>
    </section>
  );
}
