export const PARTNER_ENDPOINTS = {
  SERVICES: "/api/v1/services",
  MY_SERVICES: "/api/v1/services/me",
  PACKAGES: "/api/v1/packages",
  MY_PACKAGES: "/api/v1/packages/me",
  ITEMS_FOR_SERVICE: (serviceId) => `/api/v1/items/services/${serviceId}`,
  AGENDAS_FOR_SERVICE: (serviceId) => `/api/v1/agendas/services/${serviceId}`,
};
