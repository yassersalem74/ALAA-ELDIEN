import React from "react";

export default function IdeaSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className=" mx-auto px-8 lg:px-20">

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ===== LEFT: IMAGE ===== */}
          <div className="flex justify-center">
            <img
              src="/ideaSection.png"
              alt="Idea concept"
              className="
                w-full
                max-w-[520px]
                rounded-[24px]
                object-contain
              "
            />
          </div>

          {/* ===== RIGHT: TEXT ===== */}
          <div className="space-y-8">

            {/* Title */}
            <h2
              className="
                font-bold
                text-[30px] md:text-[36px] lg:text-[42px]
                leading-tight
                text-[#011C60]
              "
            >
              Where the{" "}
              <span className="text-[#EECE42]">Idea</span>{" "}
              Came From
            </h2>

            {/* Paragraph 1 */}
            <p
              className="
                text-[#808DAF]
                text-[18px] lg:text-[20px]
                leading-relaxed
                font-medium
              "
            >
              The idea started from a simple need. Daily services,
              shopping, and buying or selling products had become
              scattered across multiple platforms, making simple
              tasks more complicated than they should be.
            </p>

            {/* Paragraph 2 */}
            <p
              className="
                text-[#808DAF]
                text-[18px] lg:text-[20px]
                leading-relaxed
                font-medium
              "
            >
              We believed everything people need could live in one
              place — easier, faster, and more reliable.
            </p>

          </div>

        </div>
      </div>
    </section>
  );
}
