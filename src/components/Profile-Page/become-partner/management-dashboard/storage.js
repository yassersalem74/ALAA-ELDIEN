export const SERVICE_STORAGE_KEY = "alaa-partner-services";
export const PACKAGE_STORAGE_KEY = "alaa-partner-packages";

export const readStoredList = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
};

export const writeStoredList = (storageKey, items) => {
  localStorage.setItem(storageKey, JSON.stringify(items));
};
