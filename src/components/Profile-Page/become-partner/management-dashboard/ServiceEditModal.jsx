import { useEffect, useState } from "react";

import { getNeighborhoods } from "../../../../api/auth/auth.api";
import {
  FieldLabel,
  INPUT_CLASS_NAME,
  ModalShell,
  PlusIcon,
  SELECT_CLASS_NAME,
  SelectArrow,
  TEXTAREA_CLASS_NAME,
} from "../add-service-flow/PartnerFlowShared";
import {
  HOUR_OPTIONS,
  MAX_SERVICE_TIME_HOURS,
  SERVICE_CATEGORY_OPTIONS,
  WEEKDAY_OPTIONS,
  calculateTotalHours,
  formatHourLabel,
  getCategoryLabel,
} from "../add-service-flow/partnerFlowData";

const createEmptyItem = () => ({
  itemName: "",
  price: "",
  description: "",
});

const normalizeItems = (items = []) =>
  items.map((item, index) => ({
    id:
      item.id ||
      item.itemId ||
      item.serviceItemId ||
      item.name ||
      item.itemName ||
      `service-item-edit-${index}`,
    itemName: item.itemName || item.name || item.serviceItemName || "",
    price: String(item.price ?? item.itemPrice ?? item.serviceItemPrice ?? ""),
    description:
      item.description || item.itemDescription || item.serviceItemDescription || "",
  }));

const normalizeWeekdayValue = (value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) return "";

  return (
    WEEKDAY_OPTIONS.find((day) => day.toLowerCase() === rawValue.toLowerCase()) ||
    rawValue.charAt(0).toUpperCase() + rawValue.slice(1).toLowerCase()
  );
};

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const API_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getApiAgendaId = (agenda) => {
  const id = String(
    agenda?.id ||
      agenda?.agendaId ||
      agenda?.serviceAgendaId ||
      agenda?.Id ||
      agenda?.AgendaId ||
      agenda?.ServiceAgendaId ||
      ""
  ).trim();

  return API_ID_PATTERN.test(id) ? id : "";
};

const getAgendaTime = (agenda, fieldNames) =>
  fieldNames
    .map((fieldName) => agenda?.[fieldName])
    .find((value) => value !== undefined && value !== null && value !== "");

const AGENDA_DAY_FIELDS = [
  "day",
  "Day",
  "dayOfWeek",
  "DayOfWeek",
  "weekDay",
  "WeekDay",
  "weekday",
  "Weekday",
  "name",
  "Name",
];

const AGENDA_FROM_FIELDS = [
  "from",
  "From",
  "fromTime",
  "FromTime",
  "start",
  "Start",
  "startTime",
  "StartTime",
  "startHour",
  "StartHour",
  "startDate",
  "StartDate",
];

const AGENDA_TO_FIELDS = [
  "to",
  "To",
  "toTime",
  "ToTime",
  "end",
  "End",
  "endTime",
  "EndTime",
  "endHour",
  "EndHour",
  "endDate",
  "EndDate",
];

const getAgendaDayValue = (agenda) =>
  typeof agenda === "string" ? agenda : getAgendaTime(agenda, AGENDA_DAY_FIELDS);

const isAgendaLike = (item) => {
  if (typeof item === "string") {
    return WEEKDAY_OPTIONS.includes(normalizeWeekdayValue(item));
  }

  if (!item || typeof item !== "object") return false;

  return Boolean(getAgendaDayValue(item));
};

const findAgendaArray = (value, seen = new Set()) => {
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);

  if (Array.isArray(value)) {
    return value.some(isAgendaLike) ? value : [];
  }

  const preferredKeys = [
    "agendas",
    "Agendas",
    "agendaDtos",
    "AgendaDtos",
    "agendaDTOs",
    "AgendaDTOs",
    "serviceAgendas",
    "ServiceAgendas",
    "availabilities",
    "Availabilities",
    "availableDays",
    "AvailableDays",
    "schedules",
    "Schedules",
    "workingHours",
    "WorkingHours",
  ];

  for (const key of preferredKeys) {
    const nestedAgendas = findAgendaArray(value[key], seen);

    if (nestedAgendas.length > 0) return nestedAgendas;
  }

  for (const nestedValue of Object.values(value)) {
    const nestedAgendas = findAgendaArray(nestedValue, seen);

    if (nestedAgendas.length > 0) return nestedAgendas;
  }

  return [];
};

const getHourValue = (timeValue, fallbackHour) => {
  const rawValue = String(timeValue || "");
  const match =
    rawValue.match(/T(\d{1,2}):/) ||
    rawValue.match(/(?:^|\s)(\d{1,2}):/) ||
    rawValue.match(/^(\d{1,2})$/);
  const hour = match ? Number(match[1] || match[0]) : Number.NaN;

  return Number.isFinite(hour) ? String(Math.min(Math.max(hour, 0), 23)) : fallbackHour;
};

const isFullDayAgendaWindow = (fromTime, toTime) => {
  const fromValue = String(fromTime || "");
  const toValue = String(toTime || "");
  const startsAtMidnight = /^0?0:0?[01](?::0{2})?$/.test(fromValue);
  const endsAtFullDay =
    /^0?0:0?0(?::0{2})?$/.test(toValue) || /^23:59(?::0{2})?$/.test(toValue);

  return (
    (startsAtMidnight && endsAtFullDay) ||
    (Boolean(fromTime) &&
      Boolean(toTime) &&
      getHourValue(fromTime, "") === getHourValue(toTime, ""))
  );
};

const getAvailabilityDayWindow = (availability, day) => {
  const normalizedDay = normalizeWeekdayValue(day);
  const dayWindows = availability?.dayWindows || {};

  return (
    dayWindows[day] ||
    dayWindows[normalizedDay] || {
      startHour: availability?.startHour || "9",
      endHour: availability?.endHour || "17",
      dailyWindow: Boolean(availability?.dailyWindow),
    }
  );
};

const normalizeAvailabilityDays = (...dayLists) => [
  ...new Set(
    dayLists
      .flatMap((days) => (Array.isArray(days) ? days : []))
      .map(normalizeWeekdayValue)
      .filter(Boolean)
  ),
];

const normalizeAgendaList = (service) => {
  const availability = service.availability || service.Availability || {};
  const agendas =
    firstPresentValue(
      service.agendas,
      service.Agendas,
      service.agendaDtos,
      service.AgendaDtos,
      service.agendaDTOs,
      service.AgendaDTOs,
      service.serviceAgendas,
      service.ServiceAgendas,
      service.availabilities,
      service.Availabilities,
      service.availableDays,
      service.AvailableDays,
      service.schedules,
      service.Schedules,
      service.workingHours,
      service.WorkingHours,
      availability.agendas,
      availability.Agendas,
      availability.items,
      availability.Items
    ) || [];

  if (Array.isArray(agendas)) return agendas;
  if (Array.isArray(agendas.agendas)) return agendas.agendas;
  if (Array.isArray(agendas.Agendas)) return agendas.Agendas;
  if (Array.isArray(agendas.items)) return agendas.items;
  if (Array.isArray(agendas.Items)) return agendas.Items;

  const days = firstPresentValue(
    service.days,
    service.Days,
    availability.days,
    availability.Days
  );

  if (Array.isArray(days) && days.length > 0) {
    return days.map((day) => ({
      day,
      from: firstPresentValue(
        service.from,
        service.From,
        service.fromTime,
        service.FromTime,
        service.start,
        service.Start,
        service.startTime,
        service.StartTime,
        service.startHour,
        service.StartHour,
        availability.from,
        availability.From,
        availability.fromTime,
        availability.FromTime,
        availability.start,
        availability.Start,
        availability.startTime,
        availability.StartTime,
        availability.startHour,
        availability.StartHour
      ),
      to: firstPresentValue(
        service.to,
        service.To,
        service.toTime,
        service.ToTime,
        service.end,
        service.End,
        service.endTime,
        service.EndTime,
        service.endHour,
        service.EndHour,
        availability.to,
        availability.To,
        availability.toTime,
        availability.ToTime,
        availability.end,
        availability.End,
        availability.endTime,
        availability.EndTime,
        availability.endHour,
        availability.EndHour
      ),
    }));
  }

  return findAgendaArray(service);
};

const normalizeAvailability = (service) => {
  const availability = service.availability || service.Availability || {};
  const agendaList = normalizeAgendaList(service);
  const firstAgenda = agendaList[0] || {};
  const fromTime = firstPresentValue(
    availability.startHour,
    availability.StartHour,
    availability.from,
    availability.From,
    availability.fromTime,
    availability.FromTime,
    availability.start,
    availability.Start,
    availability.startTime,
    availability.StartTime,
    getAgendaTime(firstAgenda, AGENDA_FROM_FIELDS)
  );
  const toTime = firstPresentValue(
    availability.endHour,
    availability.EndHour,
    availability.to,
    availability.To,
    availability.toTime,
    availability.ToTime,
    availability.end,
    availability.End,
    availability.endTime,
    availability.EndTime,
    getAgendaTime(firstAgenda, AGENDA_TO_FIELDS)
  );
  const days = normalizeAvailabilityDays(
    agendaList.map(getAgendaDayValue),
    availability.days,
    availability.Days,
    availability.availableDays,
    availability.AvailableDays
  );
  const dayWindows = agendaList.reduce((windows, agenda) => {
    const day = normalizeWeekdayValue(getAgendaDayValue(agenda));

    if (!day) return windows;

    const existingWindow = getAvailabilityDayWindow(availability, day);
    const agendaFrom = getAgendaTime(agenda, AGENDA_FROM_FIELDS);
    const agendaTo = getAgendaTime(agenda, AGENDA_TO_FIELDS);

    return {
      ...windows,
      [day]: {
        agendaId: getApiAgendaId(agenda),
        startHour: getHourValue(agendaFrom, existingWindow.startHour || "9"),
        endHour: getHourValue(agendaTo, existingWindow.endHour || "17"),
        dailyWindow:
          Boolean(existingWindow.dailyWindow) ||
          isFullDayAgendaWindow(agendaFrom, agendaTo),
      },
    };
  }, { ...(availability.dayWindows || {}) });

  const agendaIdsByDay = agendaList.reduce((idsByDay, agenda) => {
    const day = normalizeWeekdayValue(getAgendaDayValue(agenda));
    const agendaId = getApiAgendaId(agenda);

    return day && agendaId ? { ...idsByDay, [day]: agendaId } : idsByDay;
  }, {});

  return {
    days,
    startHour: getHourValue(fromTime, "9"),
    endHour: getHourValue(toTime, "17"),
    dailyWindow: Boolean(availability.dailyWindow) || isFullDayAgendaWindow(fromTime, toTime),
    dayWindows,
    agendaIdsByDay,
  };
};

const extractPayloadData = (response) => response?.data ?? response;

const extractList = (response) => {
  const data = extractPayloadData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;

  return [];
};

const toOption = (item) => ({
  value: item.id,
  label: item.name,
});

const normalizeComparableLabel = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const getServiceNameOptionByLabel = (serviceNameOptions, serviceName) => {
  const normalizedServiceName = normalizeComparableLabel(serviceName);

  if (!normalizedServiceName) return null;

  return (
    serviceNameOptions.find(
      (option) => normalizeComparableLabel(option.label) === normalizedServiceName
    ) || null
  );
};

const normalizeIdList = (value) => [
  ...new Set(
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => {
        if (Array.isArray(item)) return normalizeIdList(item);
        if (item && typeof item === "object") {
          return item.id || item.neighborhoodId || item.value || "";
        }
        return item;
      })
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  ),
];

export default function ServiceEditModal({
  service,
  serviceNameOptions = [],
  governorateOptions = [],
  onClose,
  onSave,
}) {
  const initialServiceNameOption = getServiceNameOptionByLabel(
    serviceNameOptions,
    service.serviceName
  );
  const initialAvailability = normalizeAvailability(service);
  const [draft, setDraft] = useState({
    ...service,
    serviceNameId: service.serviceNameId || initialServiceNameOption?.value || "",
    serviceName: service.serviceName || initialServiceNameOption?.label || "",
    availability: initialAvailability,
    items: normalizeItems(service.items),
    photoNames: service.photoNames || [],
    photos: service.photos || [],
    deletedImages: service.deletedImages || [],
    coverageArea: normalizeIdList(service.coverageArea),
  });
  const [draftItem, setDraftItem] = useState(createEmptyItem);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemFormError, setItemFormError] = useState("");
  const [formError, setFormError] = useState("");
  const [neighborhoodOptions, setNeighborhoodOptions] = useState([]);
  const [uploadError, setUploadError] = useState("");
  const hasSelectedCategoryOption = SERVICE_CATEGORY_OPTIONS.some(
    (option) => option.value === draft.category
  );
  const hasSelectedServiceNameOption = serviceNameOptions.some(
    (option) => option.value === draft.serviceNameId
  );
  const hasSelectedGovernorateOption = governorateOptions.some(
    (option) => option.value === draft.governorate
  );
  const selectedCoverageAreaIds = normalizeIdList(draft.coverageArea);
  const coverageAreaOptions = [
    ...neighborhoodOptions,
    ...selectedCoverageAreaIds
      .filter(
        (areaId) => !neighborhoodOptions.some((option) => option.value === areaId)
      )
      .map((areaId) => ({ value: areaId, label: areaId })),
  ];
  const selectedAvailabilityRows = (draft.availability.days || []).map((day) => {
    const window = getAvailabilityDayWindow(draft.availability, day);
    const totalHours = calculateTotalHours(window.startHour, window.endHour);

    return {
      day,
      window,
      totalHours,
      isValid: window.dailyWindow || totalHours > 0,
    };
  });

  useEffect(() => {
    if (!draft.governorate) {
      return;
    }

    const fetchNeighborhoods = async () => {
      try {
        const response = await getNeighborhoods(draft.governorate, "en");
        setNeighborhoodOptions(extractList(response).map(toOption));
      } catch {
        setNeighborhoodOptions([]);
      }
    };

    fetchNeighborhoods();
  }, [draft.governorate]);

  const handleFieldChange = (fieldName, value) => {
    setFormError("");

    if (fieldName === "governorate" && !value) {
      setNeighborhoodOptions([]);
    }

    setDraft((currentDraft) => {
      if (fieldName === "governorate") {
        return {
          ...currentDraft,
          governorate: value,
          coverageArea: [],
        };
      }

      return {
        ...currentDraft,
        [fieldName]: value,
      };
    });
  };

  const handleServiceNameChange = (serviceNameId) => {
    setFormError("");

    const selectedServiceName = serviceNameOptions.find(
      (option) => option.value === serviceNameId
    );

    setDraft((currentDraft) => ({
      ...currentDraft,
      serviceNameId,
      serviceName: selectedServiceName?.label || "",
    }));
  };

  const handleCoverageAreaToggle = (areaId) => {
    setFormError("");

    setDraft((currentDraft) => {
      const currentAreaIds = normalizeIdList(currentDraft.coverageArea);

      return {
        ...currentDraft,
        coverageArea: currentAreaIds.includes(areaId)
          ? currentAreaIds.filter((currentAreaId) => currentAreaId !== areaId)
          : [...currentAreaIds, areaId],
      };
    });
  };

  const handleAvailabilityDayChange = (day, fieldName, value) => {
    setFormError("");

    setDraft((currentDraft) => {
      const currentWindow = getAvailabilityDayWindow(currentDraft.availability, day);

      return {
        ...currentDraft,
        availability: {
          ...currentDraft.availability,
          dayWindows: {
            ...(currentDraft.availability.dayWindows || {}),
            [day]: {
              ...currentWindow,
              [fieldName]: value,
            },
          },
        },
      };
    });
  };

  const handleDailyWindowChange = (day, nextValue) => {
    handleAvailabilityDayChange(day, "dailyWindow", nextValue);

    if (nextValue) {
      handleAvailabilityDayChange(day, "startHour", "0");
      handleAvailabilityDayChange(day, "endHour", "0");
    } else {
      handleAvailabilityDayChange(day, "startHour", "9");
      handleAvailabilityDayChange(day, "endHour", "17");
    }
  };

  const handleToggleDay = (day) => {
    setFormError("");

    setDraft((currentDraft) => {
      const days = currentDraft.availability.days || [];
      const nextDays = days.includes(day)
        ? days.filter((currentDay) => currentDay !== day)
        : [...days, day];
      const nextDayWindows = { ...(currentDraft.availability.dayWindows || {}) };

      if (days.includes(day)) {
        delete nextDayWindows[day];
      } else if (!nextDayWindows[day]) {
        nextDayWindows[day] = {
          agendaId: currentDraft.availability.agendaIdsByDay?.[day] || "",
          startHour: currentDraft.availability.startHour || "9",
          endHour: currentDraft.availability.endHour || "17",
          dailyWindow: Boolean(currentDraft.availability.dailyWindow),
        };
      }

      return {
        ...currentDraft,
        availability: {
          ...currentDraft.availability,
          days: nextDays,
          dayWindows: nextDayWindows,
        },
      };
    });
  };

  const handleItemFieldChange = (fieldName, value) => {
    setDraftItem((currentItem) => ({
      ...currentItem,
      [fieldName]: value,
    }));
  };

  const handleAddItem = () => {
    if (
      !draftItem.itemName.trim() ||
      !draftItem.price.trim() ||
      !draftItem.description.trim()
    ) {
      setItemFormError("Please complete item name, price, and description.");
      return;
    }

    const nextItem = {
      id: editingItemId || `service-item-edit-${Date.now()}`,
      itemName: draftItem.itemName.trim(),
      price: draftItem.price.trim(),
      description: draftItem.description.trim(),
    };

    setDraft((currentDraft) => ({
      ...currentDraft,
      items: editingItemId
        ? (currentDraft.items || []).map((item) =>
            item.id === editingItemId ? nextItem : item
          )
        : [...(currentDraft.items || []), nextItem],
    }));
    setDraftItem(createEmptyItem());
    setEditingItemId(null);
    setItemFormError("");
  };

  const handleEditItem = (item) => {
    setDraftItem({
      itemName: item.itemName || "",
      price: String(item.price ?? ""),
      description: item.description || "",
    });
    setEditingItemId(item.id);
    setItemFormError("");
  };

  const handleCancelItemEdit = () => {
    setDraftItem(createEmptyItem());
    setEditingItemId(null);
    setItemFormError("");
  };

  const handleRemoveItem = (itemId) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      items: (currentDraft.items || []).filter((item) => item.id !== itemId),
    }));

    if (editingItemId === itemId) {
      handleCancelItemEdit();
    }
  };

  const handlePhotoChange = (fileList) => {
    const files = Array.from(fileList || []);

    setDraft((currentDraft) => {
      const existingCount = currentDraft.photoNames.length;
      const nextFiles = [...(currentDraft.photos || [])];

      files.forEach((file) => {
        const alreadySelected = nextFiles.some(
          (currentFile) =>
            currentFile.name === file.name &&
            currentFile.size === file.size &&
            currentFile.lastModified === file.lastModified
        );

        if (!alreadySelected && existingCount + nextFiles.length < 5) {
          nextFiles.push(file);
        }
      });

      if (existingCount + (currentDraft.photos || []).length + files.length > 5) {
        setUploadError("You can keep up to 5 photos only.");
      } else {
        setUploadError("");
      }

      return {
        ...currentDraft,
        photos: nextFiles,
      };
    });
  };

  const handleRemoveExistingPhoto = (photoName) => {
    setUploadError("");
    setDraft((currentDraft) => ({
      ...currentDraft,
      photoNames: currentDraft.photoNames.filter((name) => name !== photoName),
      deletedImages: currentDraft.deletedImages.includes(photoName)
        ? currentDraft.deletedImages
        : [...currentDraft.deletedImages, photoName],
    }));
  };

  const handleRemoveNewPhoto = (photoIndex) => {
    setUploadError("");
    setDraft((currentDraft) => ({
      ...currentDraft,
      photos: currentDraft.photos.filter((_, index) => index !== photoIndex),
    }));
  };

  const handleSave = () => {
    const selectedCoverageLabels = selectedCoverageAreaIds.map(
      (areaId) =>
        coverageAreaOptions.find((option) => option.value === areaId)?.label ||
        areaId
    );
    const governorateLabel =
      governorateOptions.find((option) => option.value === draft.governorate)
        ?.label || draft.governorate;
    const selectedServiceName =
      serviceNameOptions.find((option) => option.value === draft.serviceNameId) ||
      getServiceNameOptionByLabel(serviceNameOptions, draft.serviceName);
    const initialAvailabilityDaySet = new Set(initialAvailability.days || []);
    const hasAddedAvailabilityDays = (draft.availability.days || []).some(
      (day) => !initialAvailabilityDaySet.has(normalizeWeekdayValue(day))
    );

    if (hasAddedAvailabilityDays) {
      setFormError(
        "The API currently rejects adding new availability days while editing a service. You can edit existing days or remove days."
      );
      return;
    }

    const nextService = {
      ...draft,
      serviceNameId: draft.serviceNameId || selectedServiceName?.value || "",
      serviceName: (selectedServiceName?.label || draft.serviceName).trim(),
      categoryLabel: getCategoryLabel(draft.category),
      coverageArea: selectedCoverageAreaIds,
      location: [selectedCoverageLabels.join(", "), governorateLabel]
        .filter(Boolean)
        .join(", "),
      description: draft.description.trim(),
      longDescription: draft.longDescription.trim(),
      items: draft.items || [],
      photoNames: draft.photoNames,
      photos: draft.photos,
      deletedImages: draft.deletedImages,
    };

    onSave(nextService);
  };

  return (
    <ModalShell onClose={onClose} widthClassName="max-w-[860px]">
      <div className="max-h-[calc(100vh-5rem)] overflow-y-auto pr-1">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-['Roboto'] text-[28px] font-semibold leading-[40px] text-[#011C60]">
              Edit Service
            </h3>
            <p className="mt-1 font-['Roboto'] text-[14px] leading-5 text-[#6777A0]">
              Update the full service data saved through the provider API.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="relative">
              <FieldLabel>Service Name</FieldLabel>
              <select
                value={draft.serviceNameId || ""}
                onChange={(event) => handleServiceNameChange(event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                <option value="">Service name</option>
                {!hasSelectedServiceNameOption &&
                  draft.serviceNameId &&
                  draft.serviceName && (
                    <option value={draft.serviceNameId}>{draft.serviceName}</option>
                  )}
                {serviceNameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label className="relative">
              <FieldLabel>Category</FieldLabel>
              <select
                value={draft.category}
                onChange={(event) => handleFieldChange("category", event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                {!hasSelectedCategoryOption && draft.category && (
                  <option value={draft.category}>{draft.categoryLabel || draft.category}</option>
                )}
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <label className="relative">
              <FieldLabel>Governorate</FieldLabel>
              <select
                value={draft.governorate}
                onChange={(event) => handleFieldChange("governorate", event.target.value)}
                className={SELECT_CLASS_NAME}
              >
                {!hasSelectedGovernorateOption && draft.governorate && (
                  <option value={draft.governorate}>{draft.governorate}</option>
                )}
                {governorateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <SelectArrow />
            </label>

            <div>
              <FieldLabel>Coverage Area</FieldLabel>
              <div className="rounded-[14px] border border-[#D8DDEB] bg-white p-3 shadow-[8px_4px_16px_0px_rgba(226,232,243,0.5)]">
                <div className="max-h-44 overflow-y-auto pr-1">
                  {!draft.governorate && (
                    <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                      Select governorate first
                    </p>
                  )}

                  {draft.governorate && coverageAreaOptions.length === 0 && (
                    <p className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#9AA6C7]">
                      No coverage areas available
                    </p>
                  )}

                  {draft.governorate &&
                    coverageAreaOptions.map((option) => {
                      const isSelected = selectedCoverageAreaIds.includes(
                        option.value
                      );

                      return (
                        <label
                          key={option.value}
                          className="flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-[#F5F7FC]"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCoverageAreaToggle(option.value)}
                            className="h-4 w-4 accent-[#011C60]"
                          />
                          <span className="font-['Roboto'] text-[14px] font-semibold leading-6 text-[#011C60]">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {selectedCoverageAreaIds.length > 0 && (
                <p className="mt-2 font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                  {selectedCoverageAreaIds.length} coverage{" "}
                  {selectedCoverageAreaIds.length === 1 ? "area" : "areas"}{" "}
                  selected
                </p>
              )}
            </div>

            <label>
              <FieldLabel>Price</FieldLabel>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.price}
                onChange={(event) => handleFieldChange("price", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>

            <label>
              <FieldLabel>Service Time</FieldLabel>
              <input
                type="number"
                min="1"
                max={MAX_SERVICE_TIME_HOURS}
                step="1"
                value={draft.serviceTimeHours}
                onChange={(event) => handleFieldChange("serviceTimeHours", event.target.value)}
                className={INPUT_CLASS_NAME}
              />
            </label>
          </div>

          <label>
            <FieldLabel>Short Description</FieldLabel>
            <input
              type="text"
              value={draft.description}
              onChange={(event) => handleFieldChange("description", event.target.value)}
              className={INPUT_CLASS_NAME}
            />
          </label>

          <label>
            <FieldLabel>Long Description</FieldLabel>
            <textarea
              rows="4"
              value={draft.longDescription}
              onChange={(event) => handleFieldChange("longDescription", event.target.value)}
              className={TEXTAREA_CLASS_NAME}
            />
          </label>

          <div>
            <FieldLabel>Images</FieldLabel>
            <label className="block cursor-pointer rounded-2xl border border-dashed border-[#D7DDED] bg-white p-4 transition hover:border-[#011C60]">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  handlePhotoChange(event.target.files);
                  event.target.value = "";
                }}
              />
              <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#EFF3FF] px-4 font-['Roboto'] text-[14px] font-medium text-[#011C60]">
                <PlusIcon className="h-4 w-4" />
                Add images
              </span>
            </label>

            {(draft.photoNames.length > 0 || draft.photos.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.photoNames.map((photoName) => (
                  <span
                    key={photoName}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {photoName}
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photoName)}
                      aria-label={`Remove ${photoName}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}

                {draft.photos.map((file, index) => (
                  <span
                    key={`${file.name}-${file.lastModified}`}
                    className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-1.5 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    {file.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      aria-label={`Remove ${file.name}`}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}

            {uploadError && (
              <p className="mt-2 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                {uploadError}
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Service Items</FieldLabel>
            {(draft.items || []).length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {draft.items.map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex max-w-full items-center gap-2 rounded-full bg-[#EAF0FF] px-3 py-2 font-['Roboto'] text-[13px] font-medium text-[#011C60]"
                  >
                    <span className="truncate">
                      {item.itemName} - EGP {item.price}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-[12px] font-semibold text-[#011C60] transition hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label={`Remove ${item.itemName}`}
                      className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6777A0] transition hover:bg-white hover:text-[#011C60]"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <label>
                <input
                  type="text"
                  value={draftItem.itemName}
                  onChange={(event) =>
                    handleItemFieldChange("itemName", event.target.value)
                  }
                  placeholder="Item name"
                  className={INPUT_CLASS_NAME}
                />
              </label>
              <label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftItem.price}
                  onChange={(event) =>
                    handleItemFieldChange("price", event.target.value)
                  }
                  placeholder="Price"
                  className={INPUT_CLASS_NAME}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_150px] md:items-start">
              <label>
                <textarea
                  rows="3"
                  value={draftItem.description}
                  onChange={(event) =>
                    handleItemFieldChange("description", event.target.value)
                  }
                  placeholder="Item description"
                  className={TEXTAREA_CLASS_NAME}
                />
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="min-h-12 cursor-pointer rounded-2xl bg-[#011C60] px-5 font-['Roboto'] text-[15px] font-semibold text-white transition hover:bg-[#02267F]"
              >
                {editingItemId ? "Update Item" : "Add Item"}
              </button>
            </div>

            {editingItemId && (
              <button
                type="button"
                onClick={handleCancelItemEdit}
                className="mt-3 cursor-pointer font-['Roboto'] text-[14px] font-medium text-[#6777A0] transition hover:text-[#011C60]"
              >
                Cancel item edit
              </button>
            )}

            {itemFormError && (
              <p className="mt-2 font-['Roboto'] text-[14px] leading-5 text-[#DC2626]">
                {itemFormError}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#E6E8EF] bg-[#FCFCFE] p-4">
            <FieldLabel>Availability Days</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_OPTIONS.map((day) => {
                const isSelected = draft.availability.days.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`rounded-xl border px-3 py-2 font-['Roboto'] text-[13px] font-medium transition ${
                      isSelected
                        ? "border-[#011C60] bg-[#011C60] text-white"
                        : "border-[#CCD2DF] bg-white text-[#6777A0]"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {selectedAvailabilityRows.length > 0 && (
              <div className="mt-4 flex flex-col gap-3">
                {selectedAvailabilityRows.map(({ day, window, totalHours, isValid }) => (
                  <div
                    key={day}
                    className="rounded-2xl border border-[#E6E8EF] bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                      <div className="min-w-[130px]">
                        <p className="font-['Roboto'] text-[16px] font-medium leading-6 text-[#011C60]">
                          {day}
                        </p>
                        <p className="font-['Roboto'] text-[13px] leading-5 text-[#6777A0]">
                          {window.dailyWindow
                            ? "12:00 AM to 11:59 PM"
                            : `${formatHourLabel(
                                window.startHour
                              )} to ${formatHourLabel(window.endHour)}`}
                        </p>
                      </div>

                      <label className="relative flex-1">
                        <FieldLabel>From</FieldLabel>
                        <select
                          value={window.startHour}
                          onChange={(event) =>
                            handleAvailabilityDayChange(
                              day,
                              "startHour",
                              event.target.value
                            )
                          }
                          className={SELECT_CLASS_NAME}
                          disabled={window.dailyWindow}
                        >
                          {HOUR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <SelectArrow />
                      </label>

                      <label className="relative flex-1">
                        <FieldLabel>To</FieldLabel>
                        <select
                          value={window.endHour}
                          onChange={(event) =>
                            handleAvailabilityDayChange(
                              day,
                              "endHour",
                              event.target.value
                            )
                          }
                          className={SELECT_CLASS_NAME}
                          disabled={window.dailyWindow}
                        >
                          {HOUR_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <SelectArrow />
                      </label>

                      <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl bg-[#F3F4F7] px-4">
                        <input
                          type="checkbox"
                          checked={window.dailyWindow}
                          onChange={(event) =>
                            handleDailyWindowChange(day, event.target.checked)
                          }
                          className="h-4 w-4"
                        />
                        <span className="font-['Roboto'] text-[14px] font-medium text-[#011C60]">
                          Daily Window
                        </span>
                      </label>
                    </div>

                    <p
                      className={`mt-3 font-['Roboto'] text-[14px] leading-5 ${
                        isValid ? "text-[#6777A0]" : "text-[#DC2626]"
                      }`}
                    >
                      Total hours: {window.dailyWindow ? 24 : totalHours}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formError && (
            <div className="rounded-2xl border border-[#F5C2C7] bg-[#FFF5F5] px-4 py-3 font-['Roboto'] text-[14px] leading-5 text-[#842029]">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 cursor-pointer rounded-2xl border border-[#011C60] px-6 font-['Roboto'] text-[16px] font-semibold text-[#011C60]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="min-h-12 cursor-pointer rounded-2xl bg-[#011C60] px-8 font-['Roboto'] text-[16px] font-semibold text-white transition hover:bg-[#02267F]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
