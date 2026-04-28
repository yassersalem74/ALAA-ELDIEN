const SENSITIVE_KEYS = ["password", "token", "accessToken", "refreshToken"];

const toText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const getFirstValue = (source, keys) => {
  if (!source) return "";

  for (const key of keys) {
    const value = toText(source[key]);

    if (value) return value;
  }

  return "";
};

export const getUserDisplayName = (user) => {
  const firstName = toText(user?.firstName);
  const lastName = toText(user?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    fullName ||
    getFirstValue(user, [
      "fullName",
      "name",
      "displayName",
      "userName",
      "username",
      "companyName",
      "email",
    ]) ||
    "User"
  );
};

export const getUserEmail = (user) =>
  getFirstValue(user, ["email", "userEmail", "mail"]);

export const getUserInitial = (user) =>
  getUserDisplayName(user).charAt(0).toUpperCase();

export const formatProfileLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getSafeProfileEntries = (user) => {
  if (!user || typeof user !== "object") return [];

  return Object.entries(user)
    .filter(([key, value]) => {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      );

      return !isSensitive && value !== null && value !== undefined && value !== "";
    })
    .map(([key, value]) => [
      formatProfileLabel(key),
      typeof value === "object" ? JSON.stringify(value) : String(value),
    ]);
};
