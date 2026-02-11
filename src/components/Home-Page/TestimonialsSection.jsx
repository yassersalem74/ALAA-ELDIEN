import React, { useState } from "react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ahmed K.",
      role: "Marketplace Seller",
      date: "30 November 2021",
      rating: 4,
      img: "/testHome.png",
      text: "This platform made my daily life so much easier. I can book services, shop for products, and explore the marketplace without switching between different apps. Everything feels simple, reliable, and well-organized.",
    },
    {
      name: "Sarah M.",
      role: "Marketplace Seller",
      date: "12 May 2022",
      rating: 3,
      img: "/testHome.png",
      text: "Amazing experience! I found everything I needed quickly.",
    },
    {
      name: "Omar A.",
      role: "Marketplace Seller",
      date: "8 Jan 2023",
      rating: 4,
      img: "/testHome.png",
      text: "Very smooth platform and reliable.",
    },
    {
      name: "Lina R.",
      role: "Marketplace Seller",
      date: "3 March 2023",
      rating: 2,
      img: "/testHome.png",
      text: "Secure and easy to use.",
    },
  ];

  const [active, setActive] = useState(0);
  const current = testimonials[active];

  const Star = ({ color }) => (
    <svg viewBox="0 0 24 24" className="w-9 h-9">
      <path
        fill={color}
        d="M11.48 3.5l2.1 5.1 5.5.4-4.2 3.6 1.3 5.4-4.7-2.9-4.7 2.9 1.3-5.4-4.2-3.6 5.5-.4 2.1-5.1z"
      />
    </svg>
  );

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* HEADER */}
        <header className="text-center mb-16 space-y-6">
          <h3 className="font-medium text-[28px] text-[#EECE42]">
            TESTIMONIALS
          </h3>

          <h2 className="font-medium text-[32px] md:text-[42px] text-[#011C60]">
            What Our Users Say
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-3xl mx-auto font-medium">
            Real experiences from people who use our platform.
          </p>
        </header>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* LEFT LIST */}
          <aside className="flex flex-col justify-between">
            {testimonials.map((t, i) => (
              <div
                key={i}
                onClick={() => setActive(i)}
                className={`
                  flex items-center justify-between
                  cursor-pointer 
                  transition
                  ${active === i ? "opacity-100" : "opacity-70"}
                `}
              >
                {/* LEFT */}
                <div>
                  <h4 className="text-[22px] font-medium text-[#011C60]">
                    {t.name}
                  </h4>

                  <p className="text-[16px] text-[#99A4BF] font-medium">
                    {t.date}
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right">
                  <p className="text-[#011C60] font-medium">{t.role}</p>

                  <div className="flex items-center gap-1 justify-end mt-1">
                    {[1, 2, 3, 4, 5].map((s) => {
                      let color;

                      if (active === i) {
                        // ACTIVE row
                        color = s <= t.rating ? "#EECE42" : "#CCD2DF";
                      } else {
                        // INACTIVE rows
                        color = s <= t.rating ? "#99A4BF" : "#CCD2DF";
                      }

                      return <Star key={s} color={color} />;
                    })}

                    <span className="ml-2 text-[#011C60] font-medium">
                      (4.8)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </aside>

          {/* RIGHT SIDE */}
          <article className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-4">
              <img
                src={current.img}
                className="w-16 h-16 rounded-full object-cover"
              />

              <div>
                <h4 className="text-[24px] font-medium text-[#011C60]">
                  {current.name}
                </h4>

                <p className="text-[#011C60] font-medium">{current.role}</p>
              </div>
            </div>

            <blockquote
              className="
                bg-[#EECE42]
                p-6 rounded-2xl
                text-[#011C60]
                text-[20px]
                font-medium
                leading-relaxed
                mt-6 flex-grow
                transition-all duration-300

                hover:bg-[linear-gradient(270deg,#F5E28E_0%,#FDFAEC_72.6%,#FFFFFF_86.3%)]
                hover:shadow-lg
                hover:scale-[1.02]
              "
            >
              “{current.text}”
            </blockquote>
          </article>
        </div>
      </div>
    </section>
  );
}
