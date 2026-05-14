import { BriefcaseIcon, PackageIcon, PANEL_CLASS_NAME } from "../add-service-flow/PartnerFlowShared";

function EditIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M11.8 4.2L15.8 8.2M3.8 16.2L7.6 15.4L16.6 6.4C17.2 5.8 17.2 4.8 16.6 4.2L15.8 3.4C15.2 2.8 14.2 2.8 13.6 3.4L4.6 12.4L3.8 16.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 5.5H16M8 8.5V14M12 8.5V14M6 5.5L6.7 16H13.3L14 5.5M8 5.5V4H12V5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ManagementTable({
  title,
  description,
  itemType,
  items,
  nameHeader,
  categoryHeader,
  priceHeader,
  scheduleHeader,
  getName,
  getCategory,
  getPrice,
  renderSchedule,
  onAdd,
  onEdit,
  onDelete,
}) {
  const Icon = itemType === "package" ? PackageIcon : BriefcaseIcon;
  const showCategory = Boolean(categoryHeader && getCategory);
  const showSchedule = Boolean(scheduleHeader && renderSchedule);
  const desktopGridClassName =
    showCategory && showSchedule
      ? "md:min-w-[940px] md:grid-cols-[1.2fr_0.9fr_1.4fr_0.8fr_120px]"
      : showCategory
        ? "md:min-w-[760px] md:grid-cols-[1.4fr_1fr_1fr_120px]"
        : "md:min-w-[640px] md:grid-cols-[1.5fr_1fr_120px]";

  return (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              {title}
            </h3>
            <p className="mt-2 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="min-h-12 min-w-[170px] cursor-pointer rounded-2xl bg-[#011C60] px-6 py-3 font-['Roboto'] text-[16px] font-semibold leading-6 text-white transition hover:bg-[#02267F]"
          >
            Add New {itemType === "package" ? "Package" : "Service"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E6E8EF] bg-white">
          <div
            className={`hidden border-b border-[#E6E8EF] bg-[#F8F9FC] px-5 py-4 md:grid ${desktopGridClassName}`}
          >
            <span className="font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
              {nameHeader}
            </span>
            {showCategory && (
              <span className="font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
                {categoryHeader}
              </span>
            )}
            {showSchedule && (
              <span className="font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
                {scheduleHeader}
              </span>
            )}
            <span className="font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
              {priceHeader}
            </span>
            <span className="text-right font-['Roboto'] text-[14px] font-semibold leading-5 text-[#011C60]">
              Actions
            </span>
          </div>

          <div className="divide-y divide-[#EEF1F7]">
            {items.map((item) => (
              <article
                key={item.id}
                className={`grid gap-4 px-4 py-4 md:items-center md:px-5 ${desktopGridClassName}`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF3FF]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span className="block font-['Roboto'] text-[15px] font-semibold leading-6 text-[#011C60]">
                      {getName(item)}
                    </span>
                    <span className="block md:hidden font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                      {showCategory && getCategory(item)
                        ? `${getCategory(item)} · `
                        : ""}
                      EGP {getPrice(item)}
                    </span>
                    {showSchedule && (
                      <div className="mt-3 md:hidden">{renderSchedule(item)}</div>
                    )}
                  </div>
                </div>

                {showCategory && (
                  <span className="hidden font-['Roboto'] text-[15px] font-medium leading-6 text-[#011C60] md:block">
                    {getCategory(item)}
                  </span>
                )}

                {showSchedule && (
                  <div className="hidden min-w-0 md:block">{renderSchedule(item)}</div>
                )}

                <span className="hidden font-['Roboto'] text-[15px] font-medium leading-6 text-[#011C60] md:block">
                  EGP {getPrice(item)}
                </span>

                <div className="flex items-center gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${getName(item)}`}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#D7DDED] text-[#011C60] transition hover:border-[#011C60] hover:bg-[#EFF3FF]"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label={`Delete ${getName(item)}`}
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#F3C8C8] text-[#C83232] transition hover:bg-[#FFF0F0]"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
