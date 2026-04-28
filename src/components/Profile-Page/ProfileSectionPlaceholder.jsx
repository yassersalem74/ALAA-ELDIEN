export default function ProfileSectionPlaceholder({ title, description }) {
  return (
    <section className="rounded-[24px] border border-[#E6E8EF] bg-white p-6 shadow-[0px_12px_40px_rgba(17,27,71,0.08)] sm:p-8">
      <div className="flex min-h-[360px] flex-col justify-between gap-8">
        <div>
          <h2 className="font-['Roboto'] text-[24px] font-semibold leading-10 text-[#011C60]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl font-['Roboto'] text-[16px] leading-6 text-[#6777A0]">
            {description}
          </p>
        </div>

        <div className="rounded-[20px] border border-dashed border-[#D7DDED] bg-[#F8F9FC] px-5 py-8">
          <p className="font-['Roboto'] text-[16px] leading-6 text-[#808DAF]">
            This page is ready in the new profile layout. We can plug its final
            content in next.
          </p>
        </div>
      </div>
    </section>
  );
}
