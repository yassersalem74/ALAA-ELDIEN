import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [animating, setAnimating] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email || animating) return;

    setAnimating(true);

    setTimeout(() => setShowThanks(true), 1400);

    setTimeout(() => {
      setAnimating(false);
      setShowThanks(false);
      setEmail("");
    }, 4000);
  };

  return (
    <footer className="bg-[#F6E6A0] rounded-t-[48px] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 text-[#011C60]">
        {/* ===== GRID ===== */}
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* ===== Subscribe Section ===== */}
          <div className="space-y-6">
            <h3 className="font-bold text-[24px]">Subscribe for More News</h3>

            {/* Animated Subscribe */}
            <div className="relative w-full max-w-[360px] h-[52px] rounded-full border border-[#011C60] bg-white overflow-hidden">
              {/* Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className={`
                  absolute left-0 top-0 h-full w-full
                  px-5 pr-28
                  outline-none
                  text-[#011C60]
                  placeholder:text-[#99A4BF]
                  bg-transparent
                  transition-transform duration-300
                  ${animating ? "translate-x-[380px]" : ""}
                `}
              />

              {/* Sliding gray bar */}
              <span
                className={`
                  absolute inset-0 bg-[#CCD2DF]
                  transition-transform duration-[1000ms]
                  ${animating ? "translate-x-full" : "-translate-x-full"}
                `}
              />

              {/* Button */}
              <button
                onClick={handleSubscribe}
                className={`
                  absolute right-1 top-1/2 -translate-y-1/2
                  h-[44px] px-6
                  rounded-full
                  text-white font-medium
                  bg-[#011C60]
                  hover:bg-[#023AC6]
                  transition-all duration-500
                  cursor-pointer
                  ${animating ? "translate-y-[60px]" : ""}
                `}
              >
                Subscribe
              </button>

              {/* Thank You */}
              <span
                className={`
                  absolute left-5 top-[52px]
                  h-full flex items-center
                  text-[#011C60] font-medium
                  transition-transform duration-500
                  ${showThanks ? "-translate-y-[52px]" : ""}
                `}
              >
                Thank you. You have been subscribed
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex gap-5 pt-4">
              <img
                src="/linkedin-png.png"
                className="w-6 h-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/x-icon.png"
                className="w-6 h-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/facebook-icon.png"
                className="w-6 h-6 cursor-pointer hover:scale-110 transition"
              />
              <img
                src="/insta-icon.png"
                className="w-6 h-6 cursor-pointer hover:scale-110 transition"
              />
            </div>
          </div>

          {/* ===== Company ===== */}
          <div>
            <h3 className="font-bold text-[24px] mb-5">Company</h3>
            <ul className="space-y-3 text-[16px]">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/services">Services</Link>
              </li>
            </ul>
          </div>

          {/* ===== Resources ===== */}
          <div>
            <h3 className="font-bold text-[24px] mb-5">Resources</h3>
            <ul className="space-y-3 text-[16px]">
              <li>Blogs</li>
              <li>Podcasts</li>
              <li>Books</li>
            </ul>
          </div>

          {/* ===== Contact ===== */}
          <div className="space-y-4">
            <h3 className="font-bold text-[24px]">Contact</h3>

            <div className="space-y-3 text-[16px]">
              <p>Cairo, Egypt</p>
              <a href="mailto:info@alaaeldien.com">info@alaaeldien.com</a>
            </div>

            <button
              className=" cursor-pointer mt-4 bg-[#011C60] text-white px-6 py-3 rounded-full font-medium   text-white
              bg-[#011C60]
              transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]

              hover:bg-[linear-gradient(272.92deg,#CCD2DF_6.27%,#EECE42_95.75%)]
              hover:text-white
              hover:-translate-y-1
              hover:shadow-[0px_8px_24px_rgba(1,28,96,0.25)]
                cursor-pointer
              active:scale-95"
            >
              Free Consultation
            </button>
          </div>
        </div>

        {/* ===== Bottom Bar ===== */}
        <div className="border-t border-[#011C60]/20 mt-12 pt-6 text-center text-[14px]">
          © {new Date().getFullYear()} ALAA ELDIEN . All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
