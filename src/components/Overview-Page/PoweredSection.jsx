import React from "react";

export default function PoweredSection() {
  return (
    <section className="py-12 lg:py-16 bg-white mt-12">
      <div className="px-8 lg:px-20 mx-auto">

        {/* ===== 3 COLUMN GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">

          {/* ===== IMAGE (FIRST ON MOBILE) ===== */}
          <div className="order-2 lg:col-span-1 flex justify-center lg:justify-end">
            <img
              src="/powered-section.png"
              alt="Powered by More Solutions"
              className="w-full max-w-[420px] lg:max-w-[480px] object-contain rounded-[16px]"
            />
          </div>

          {/* ===== TEXT SIDE (2 COLS ON LG) ===== */}
          <div className="order-1 lg:col-span-2">

            {/* ===== TITLE ===== */}
            <h2 className="font-bold text-[34px] md:text-[42px] lg:text-[48px] leading-tight mb-6">
              <span className="text-[#011C60]">Powered by </span>
              <span className="text-[#EECE42]">&More Solutions</span>
            </h2>

            {/* ===== PARAGRAPH 1 ===== */}
            <p className="text-[#99A4BF] text-[18px] md:text-[20px] lg:text-[22px] font-medium leading-relaxed mb-6">
              Alaa El Din is a subsidiary of More Solutions, a technology
              company specialized in building scalable digital platforms and
              innovative digital solutions.
            </p>

            {/* ===== PARAGRAPH 2 ===== */}
            <p className="text-[#99A4BF] text-[18px] md:text-[20px] lg:text-[22px] font-medium leading-relaxed">
              With the experience and technical expertise of More Solutions,
              Alaa El Din delivers reliable, well-built products designed to
              last and grow.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
