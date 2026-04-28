export default function ServiceHeroSection() {
  return (
    <section className="mx-auto flex min-h-[330px] w-full max-w-[1120px] flex-col items-center justify-center gap-4 rounded-2xl bg-[#E6E8EF] px-6 py-9 text-center shadow-[0px_4px_16px_rgba(190,198,222,0.3)] md:px-24">
      <h1 className="max-w-4xl font-['Roboto'] text-[34px] font-bold leading-[48px] text-[#011C60] md:text-[48px] md:leading-[72px]">
        Professional Services,
        <br />
        <span className="text-[#EECE42]">All in One Place</span>
      </h1>
      <p className="max-w-3xl font-['Roboto'] text-[16px] font-medium leading-7 text-[#808DAF] md:text-[24px] md:leading-[40px]">
        Browse trusted services, compare providers, and book instantly —
        everything you need, made simple.
      </p>
    </section>
  );
}
