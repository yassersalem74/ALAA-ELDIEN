import React from "react";

export default function ContactUsSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">

        {/* ===== HEADER ===== */}
        <header className="text-center mb-16 space-y-6">
          <h3 className="font-medium text-[28px] text-[#EECE42]">
            Get in Touch
          </h3>

          <h2 className="font-bold text-[32px] md:text-[42px] text-[#011C60]">
            Let's Work Together
          </h2>

          <p className="text-[#99A4BF] text-[18px] max-w-3xl mx-auto font-medium">
            Feel free to keep in touch with us!
          </p>
        </header>

        {/* ===== CONTACT WRAPPER ===== */}
        <article className="relative rounded-2xl border border-[#B3BBCF] overflow-hidden">

          {/* MAP BG */}
          <img
            src="/contact-map.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* GLASS */}
          <div
            className="
              relative
              backdrop-blur-[8px]
              bg-[#E6E8EFB2]
              p-8 md:p-12
              grid md:grid-cols-2
              gap-12
              items-stretch
            "
          >

            {/* ===== LEFT SIDE ===== */}
            <aside className="flex flex-col justify-between">

              {[
                {
                  icon: "phone",
                  text: "010-020-0860",
                },
                {
                  icon: "mail",
                  text: "info@company.com",
                },
                {
                  icon: "web",
                  text: "www.company.com",
                },
                {
                  icon: "location",
                  text: "Cairo, Egypt",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 pb-6 border-b border-[#CCD2DF]"
                >
                  {/* ICON CIRCLE */}
                  <div
                    className="
                      w-12 h-12
                      flex items-center justify-center
                      rounded-full
                      bg-gradient-to-b
                      from-[#CCD2DF]
                      to-[#EECE42]
                      text-[#011C60]
                    "
                  >
                    {item.icon === "phone" && (
                      <svg viewBox="0 0 24 24" className="w-6">
                        <path fill="currentColor" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25Z"/>
                      </svg>
                    )}

                    {item.icon === "mail" && (
                      <svg viewBox="0 0 24 24" className="w-6">
                        <path fill="currentColor" d="M3 6h18v12H3z"/>
                      </svg>
                    )}

                    {item.icon === "web" && (
                      <svg viewBox="0 0 24 24" className="w-6">
                        <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20z"/>
                      </svg>
                    )}

                    {item.icon === "location" && (
                      <svg viewBox="0 0 24 24" className="w-6">
                        <path fill="currentColor" d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"/>
                      </svg>
                    )}
                  </div>

                  <p className="text-[20px] font-medium text-[#011C60]">
                    {item.text}
                  </p>
                </div>
              ))}

            </aside>

            {/* ===== RIGHT SIDE ===== */}
            <form className="flex flex-col justify-between">

              <div className="space-y-6">
                <h3 className="text-[36px] font-bold text-[#011C60]">
                  Contact Us
                </h3>

                <input
                  placeholder="Your Full name"
                  className="
                    w-full h-[60px]
                    rounded-[16px]
                    border border-[#CCD2DF]
                    bg-white
                    px-4 text-[18px]
                    outline-none
                  "
                />

                <input
                  placeholder="Email Or phone number"
                  className="w-full h-[60px] rounded-[16px] border border-[#CCD2DF] bg-white px-4 text-[18px]"
                />

                <input
                  placeholder="Phone number"
                  className="w-full h-[60px] rounded-[16px] border border-[#CCD2DF] bg-white px-4 text-[18px]"
                />

                <textarea
                  placeholder="Message"
                  className="
                    w-full h-[114px]
                    rounded-[16px]
                    border border-[#CCD2DF]
                    bg-white
                    px-4 py-3
                    text-[18px]
                    resize-none
                  "
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                className="
                  mt-6
                  h-[64px]
                  rounded-[16px]
                  font-medium
                  text-white
                  bg-[#011C60]
                  transition-all duration-300
                  hover:bg-gradient-to-r
                  hover:from-[#011C60]
                  hover:via-[#EECE42]
                  hover:to-[#011C60]
                "
              >
                Send Message
              </button>

            </form>

          </div>
        </article>

      </div>
    </section>
  );
}
