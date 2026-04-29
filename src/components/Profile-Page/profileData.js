import {
  getUserDisplayName,
  getUserEmail,
} from "../../utils/auth/userProfile";

export const PROFILE_NAV_ITEMS = [
  { slug: "dashboard", label: "Dashboard", icon: "dashboard" },
  { slug: "personal-info", label: "Personal Info", icon: "user" },
  { slug: "notifications", label: "Notification", icon: "bell" },
  { slug: "chats", label: "Chats", icon: "chat" },
  { slug: "cart", label: "Cart", icon: "cart" },
  { slug: "orders", label: "My Order", icon: "orders" },
  { slug: "become-provider", label: "Become a Partner", icon: "provider" },
  { slug: "settings", label: "Setting", icon: "settings" },
];

export const PROFILE_PERSONAL_INFO_FIELDS = [
  {
    name: "firstName",
    label: "First name",
    type: "text",
    autoComplete: "given-name",
    placeholder: "Alaa",
  },
  {
    name: "lastName",
    label: "Last name",
    type: "text",
    autoComplete: "family-name",
    placeholder: "Eldien",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "alaa.deen@serviceflow.com",
  },
  {
    name: "phoneNumber",
    label: "phone number",
    type: "tel",
    autoComplete: "tel",
    placeholder: "01098665434323",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    autoComplete: "street-address",
    placeholder: "Maadi, Egypt",
    fullWidth: true,
  },
];

const toText = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
};

const getFirstValue = (source, keys) => {
  if (!source || typeof source !== "object") return "";

  for (const key of keys) {
    const value = toText(source[key]);

    if (value) return value;
  }

  return "";
};

const getExplicitValue = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      return toText(source[key]);
    }
  }

  return null;
};

const capitalizeWord = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";

const getNamePartsFromEmail = (email) => {
  const localPart = toText(email).split("@")[0];

  if (!localPart) return [];

  return localPart
    .replace(/[._-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(capitalizeWord);
};

const buildLocation = (user) => {
  const directLocation = getFirstValue(user, [
    "location",
    "address",
    "streetAddress",
    "fullAddress",
  ]);

  if (directLocation) return directLocation;

  const locationParts = [
    getFirstValue(user, [
      "areaName",
      "area",
      "neighborhood",
      "district",
      "city",
      "cityName",
      "streetName",
    ]),
    getFirstValue(user, [
      "governorateName",
      "governorate",
      "state",
      "province",
    ]),
    getFirstValue(user, ["country", "countryName"]),
  ].filter(Boolean);

  return [...new Set(locationParts)].join(", ");
};

export const createProfileDetails = (user) => {
  const explicitFirstName = getExplicitValue(user, [
    "firstName",
    "first_name",
    "givenName",
  ]);
  const explicitLastName = getExplicitValue(user, [
    "lastName",
    "last_name",
    "familyName",
  ]);
  const explicitEmail = getExplicitValue(user, ["email", "userEmail", "mail"]);
  const explicitPhoneNumber = getExplicitValue(user, [
    "phoneNumber",
    "phone",
    "mobile",
    "mobileNumber",
    "phone_number",
  ]);
  const explicitLocation = getExplicitValue(user, ["location"]);
  const email = explicitEmail ?? getUserEmail(user);
  const displayName = getUserDisplayName(user);
  const displayNameParts =
    displayName && displayName !== email
      ? displayName.split(/\s+/).filter(Boolean)
      : [];
  const emailNameParts = getNamePartsFromEmail(email);
  const fallbackNameParts = displayNameParts.length
    ? displayNameParts
    : emailNameParts;
  const firstName = explicitFirstName ?? fallbackNameParts[0] ?? "";
  const lastName = explicitLastName ?? fallbackNameParts.slice(1).join(" ");
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    displayName ||
    fallbackNameParts.join(" ") ||
    "User";
  const welcomeName = firstName || fallbackNameParts[0] || "User";

  return {
    firstName,
    lastName,
    email: email || "",
    phoneNumber: explicitPhoneNumber ?? "",
    location: explicitLocation ?? buildLocation(user),
    fullName,
    welcomeName,
    avatarInitial: welcomeName.charAt(0).toUpperCase() || "U",
  };
};
