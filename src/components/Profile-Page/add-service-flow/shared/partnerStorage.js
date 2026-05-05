const SERVICE_META_STORAGE_KEY = "alaa_partner_service_meta";
const PACKAGE_META_STORAGE_KEY = "alaa_partner_package_meta";

const canUseBrowserStorage = () => typeof window !== "undefined";

const readStorage = (key) => {
  if (!canUseBrowserStorage()) return {};

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
};

const writeStorage = (key, value) => {
  if (!canUseBrowserStorage()) return;

  localStorage.setItem(key, JSON.stringify(value));
};

export const getServiceMetaMap = () => readStorage(SERVICE_META_STORAGE_KEY);

export const setServiceMeta = (serviceId, metadata) => {
  const currentMap = getServiceMetaMap();

  writeStorage(SERVICE_META_STORAGE_KEY, {
    ...currentMap,
    [serviceId]: metadata,
  });
};

export const removeServiceMeta = (serviceId) => {
  const currentMap = getServiceMetaMap();

  if (!currentMap[serviceId]) return;

  delete currentMap[serviceId];
  writeStorage(SERVICE_META_STORAGE_KEY, currentMap);
};

export const getPackageMetaMap = () => readStorage(PACKAGE_META_STORAGE_KEY);

export const setPackageMeta = (packageId, metadata) => {
  const currentMap = getPackageMetaMap();

  writeStorage(PACKAGE_META_STORAGE_KEY, {
    ...currentMap,
    [packageId]: metadata,
  });
};

export const removePackageMeta = (packageId) => {
  const currentMap = getPackageMetaMap();

  if (!currentMap[packageId]) return;

  delete currentMap[packageId];
  writeStorage(PACKAGE_META_STORAGE_KEY, currentMap);
};
