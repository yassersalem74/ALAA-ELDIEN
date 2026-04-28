export default function SectionHeader({ title, description }) {
  return (
    <header className="mx-auto max-w-[1290px] text-center">
      <h2 className="font-['Roboto'] text-[30px] font-bold leading-[44px] text-[#011C60] md:text-[40px] md:leading-[64px]">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-3xl font-['Roboto'] text-[16px] font-medium leading-7 text-[#808DAF] md:text-[24px] md:leading-[40px]">
        {description}
      </p>
    </header>
  );
}
