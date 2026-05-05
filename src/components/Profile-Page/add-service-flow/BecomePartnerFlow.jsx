import { useCallback, useState } from "react";

import Toast from "../../common/Toast";
import { extractAuthToken, getErrorMessage } from "../../../api/api.utils";
import { refreshAuthToken } from "../../../api/auth/auth.api";
import {
  createPackage,
  createService,
  deleteService,
  getMyPackages,
  getMyServices,
  saveServiceAgendas,
  saveServiceItems,
  updatePackage,
  updateService,
} from "../../../api/partner/partner.api";
import { changeUserRole } from "../../../api/user/user.api";
import { useAuth } from "../../../context/useAuth";
import PackageFlow from "./package-flow/PackageFlow";
import ServiceFlow from "./service-flow/ServiceFlow";
import {
  PARTNER_HOME_OPTIONS,
  buildAgendaPayload,
  createAvailabilityFromAgendas,
} from "./shared/partnerFlowData";
import {
  BackButton,
  BriefcaseIcon,
  PackageIcon,
  PANEL_CLASS_NAME,
  SectionHeading,
  joinClasses,
} from "./shared/PartnerFlowShared";
import {
  getPackageMetaMap,
  getServiceMetaMap,
  removeServiceMeta,
  setPackageMeta,
  setServiceMeta,
} from "./shared/partnerStorage";

const mergeServicesWithLocalMeta = (services) => {
  const serviceMetaMap = getServiceMetaMap();

  return services.map((service) => {
    const metadata = serviceMetaMap[service.id] || {};
    const hasLocalItems = Array.isArray(metadata.items);
    const hasLocalImages = Array.isArray(metadata.imageUrls);

    return {
      ...service,
      partnerType: metadata.partnerType || service.partnerType || "services",
      items: hasLocalItems ? metadata.items : service.items || [],
      availability:
        metadata.availability ||
        (Array.isArray(service.agendas) && service.agendas.length > 0
          ? createAvailabilityFromAgendas(service.agendas)
          : createAvailabilityFromAgendas()),
      imageUrls: hasLocalImages ? metadata.imageUrls : service.imageUrls || [],
    };
  });
};

const mergePackagesWithLocalMeta = (packages) => {
  const packageMetaMap = getPackageMetaMap();

  return packages.map((partnerPackage) => {
    const metadata = packageMetaMap[partnerPackage.id] || {};

    return {
      ...partnerPackage,
      serviceId:
        partnerPackage.serviceIds?.[0] || metadata.serviceId || partnerPackage.serviceId || "",
      includedItemIds: metadata.includedItemIds || [],
    };
  });
};

const mapServiceDraftToRequest = (draft) => ({
  name: draft.name.trim(),
  price: Number(draft.price),
  currency: draft.currency.trim(),
  categoryName: draft.categoryName,
  timeslotDurationInMin: Number(draft.timeslotDurationInMin),
  numberOfCustomerPerTimeSlots: Number(draft.numberOfCustomerPerTimeSlots),
  imageFiles: draft.imageFiles,
  description: draft.description.trim(),
  subDescription: draft.subDescription.trim(),
  neighborhoodId: draft.neighborhoodId,
  deletedImages: draft.deletedImages,
});

const mapPackageDraftToRequest = (draft) => ({
  name: draft.name.trim(),
  billingPeriod: draft.billingPeriod,
  duration: Number(draft.duration),
  price: Number(draft.price),
  serviceIds: [draft.serviceId],
});

export default function BecomePartnerFlow() {
  const { user, isProvider, refreshProfile, updateToken, updateUser } = useAuth();
  const [activeView, setActiveView] = useState("");
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [toast, setToast] = useState(null);
  const [isLoadingPartnerData, setIsLoadingPartnerData] = useState(false);
  const [isPreparingProvider, setIsPreparingProvider] = useState(false);

  const showToast = useCallback((type, message) => {
    setToast({
      id: Date.now(),
      type,
      message,
    });
  }, []);

  const refreshProviderSession = useCallback(async () => {
    try {
      const refreshResponse = await refreshAuthToken();
      const nextToken = extractAuthToken(refreshResponse);

      if (nextToken) {
        updateToken(nextToken);
      }
    } catch {
      // Some backends return a refreshed cookie or keep the existing token valid.
    }

    try {
      const profile = await refreshProfile();

      if (profile) return profile;
    } catch {
      // Keep a best-effort local update below if profile refresh fails.
    }

    const optimisticUser = {
      ...(user || {}),
      isProvider: true,
      role: "Provider",
    };

    updateUser(optimisticUser);
    return optimisticUser;
  }, [refreshProfile, updateToken, updateUser, user]);

  const ensureProviderAccess = useCallback(async () => {
    if (isProvider) return true;

    setIsPreparingProvider(true);

    try {
      try {
        await changeUserRole({ role: "Provider" });
      } catch (error) {
        const status = error?.response?.status;

        if (status !== 400 && status !== 409) {
          throw error;
        }
      }

      await refreshProviderSession();
      showToast("success", "Your provider profile is ready.");

      return true;
    } catch (error) {
      showToast(
        "error",
        getErrorMessage(error, "We couldn't activate provider access right now.")
      );

      return false;
    } finally {
      setIsPreparingProvider(false);
    }
  }, [isProvider, refreshProviderSession, showToast]);

  const withProviderRetry = useCallback(
    async (requestFn) => {
      try {
        return await requestFn();
      } catch (error) {
        if (error?.response?.status !== 403) {
          throw error;
        }

        await refreshProviderSession();
        return requestFn();
      }
    },
    [refreshProviderSession]
  );

  const loadPartnerData = useCallback(async () => {
    setIsLoadingPartnerData(true);

    try {
      const [servicesResult, packagesResult] = await Promise.allSettled([
        withProviderRetry(() => getMyServices()),
        withProviderRetry(() => getMyPackages()),
      ]);

      const nextServices =
        servicesResult.status === "fulfilled"
          ? mergeServicesWithLocalMeta(servicesResult.value)
          : [];
      const nextPackages =
        packagesResult.status === "fulfilled"
          ? mergePackagesWithLocalMeta(packagesResult.value)
          : [];

      setServices(nextServices);
      setPackages(nextPackages);

      if (
        servicesResult.status === "rejected" &&
        packagesResult.status === "rejected"
      ) {
        showToast(
          "error",
          getErrorMessage(
            servicesResult.reason,
            "We couldn't load your partner dashboard right now."
          )
        );
      }
    } finally {
      setIsLoadingPartnerData(false);
    }
  }, [showToast, withProviderRetry]);

  const handleOpenView = useCallback(
    async (view) => {
      const hasProviderAccess = await ensureProviderAccess();

      if (!hasProviderAccess) return;

      setActiveView(view);
      await loadPartnerData();
    },
    [ensureProviderAccess, loadPartnerData]
  );

  const handleCreateService = useCallback(
    async (draft) => {
      const serviceRequest = mapServiceDraftToRequest(draft);
      const createdService = await withProviderRetry(() =>
        createService(serviceRequest)
      );
      const serviceId = createdService.id || draft.id;

      if (!serviceId) {
        throw new Error("Service created successfully, but no service id was returned.");
      }

      if (draft.items.length > 0) {
        await withProviderRetry(() => saveServiceItems(serviceId, draft.items));
      }

      const agendaPayload = buildAgendaPayload(draft.availability);

      if (agendaPayload.length > 0) {
        await withProviderRetry(() =>
          saveServiceAgendas(serviceId, agendaPayload)
        );
      }

      setServiceMeta(serviceId, {
        partnerType: draft.partnerType,
        items: draft.items,
        availability: draft.availability,
        imageUrls: createdService.imageUrls || draft.existingImages || [],
      });

      await loadPartnerData();

      return serviceId;
    },
    [loadPartnerData, withProviderRetry]
  );

  const handleUpdateService = useCallback(
    async (draft) => {
      const serviceId = draft.id;

      const updatedService = await withProviderRetry(() =>
        updateService(serviceId, mapServiceDraftToRequest(draft))
      );

      if (draft.items.length > 0) {
        await withProviderRetry(() => saveServiceItems(serviceId, draft.items));
      }

      const agendaPayload = buildAgendaPayload(draft.availability);

      if (agendaPayload.length > 0) {
        await withProviderRetry(() =>
          saveServiceAgendas(serviceId, agendaPayload)
        );
      }

      setServiceMeta(serviceId, {
        partnerType: draft.partnerType,
        items: draft.items,
        availability: draft.availability,
        imageUrls: updatedService.imageUrls || draft.existingImages || [],
      });

      await loadPartnerData();

      return serviceId;
    },
    [loadPartnerData, withProviderRetry]
  );

  const handleDeleteService = useCallback(
    async (serviceId) => {
      await withProviderRetry(() => deleteService(serviceId));
      removeServiceMeta(serviceId);
      await loadPartnerData();
    },
    [loadPartnerData, withProviderRetry]
  );

  const handleCreatePackage = useCallback(
    async (draft) => {
      const createdPackage = await withProviderRetry(() =>
        createPackage(mapPackageDraftToRequest(draft))
      );
      const packageId = createdPackage.id || draft.id;

      if (packageId) {
        setPackageMeta(packageId, {
          serviceId: draft.serviceId,
          includedItemIds: draft.includedItemIds,
        });
      }

      await loadPartnerData();

      return packageId;
    },
    [loadPartnerData, withProviderRetry]
  );

  const handleUpdatePackage = useCallback(
    async (draft) => {
      const packageId = draft.id;

      await withProviderRetry(() =>
        updatePackage(packageId, mapPackageDraftToRequest(draft))
      );

      if (packageId) {
        setPackageMeta(packageId, {
          serviceId: draft.serviceId,
          includedItemIds: draft.includedItemIds,
        });
      }

      await loadPartnerData();

      return packageId;
    },
    [loadPartnerData, withProviderRetry]
  );

  const renderEntryScreen = () => (
    <section className={PANEL_CLASS_NAME}>
      <div className="flex flex-col gap-8">
        <SectionHeading
          title="Start Your Journey as a Partner"
          description="Choose how you want to offer on our platform. We provide the tools you need to enroll in your profession."
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {PARTNER_HOME_OPTIONS.map((option) => {
            const isServiceCard = option.id === "service";

            return (
              <article
                key={option.id}
                className="rounded-[24px] border border-[#E6E8EF] bg-[#FCFCFE] p-5 shadow-[0px_14px_30px_rgba(17,27,71,0.04)]"
              >
                <div className="rounded-[20px] bg-[linear-gradient(180deg,#F8FAFF_0%,#FFFFFF_100%)] p-4">
                  <img
                    src={option.image}
                    alt={option.title}
                    className="mx-auto h-auto w-full max-w-[280px] object-contain"
                  />
                </div>

                <div className="mt-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EFF3FF]">
                      {isServiceCard ? (
                        <BriefcaseIcon className="h-5 w-5" />
                      ) : (
                        <PackageIcon className="h-5 w-5" />
                      )}
                    </span>

                    <h3 className="font-['Roboto'] text-[24px] font-semibold leading-9 text-[#011C60]">
                      {option.title}
                    </h3>
                  </div>

                  <p className="mt-3 font-['Roboto'] text-[15px] leading-6 text-[#6777A0]">
                    {option.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenView(option.id)}
                  disabled={isPreparingProvider || isLoadingPartnerData}
                  className={joinClasses(
                    "mt-6 min-h-12 w-full rounded-2xl px-5 py-3 font-['Roboto'] text-[16px] font-semibold text-white transition",
                    isPreparingProvider || isLoadingPartnerData
                      ? "cursor-not-allowed bg-[#B2BBD2]"
                      : "cursor-pointer bg-[#011C60] hover:bg-[#02267F]"
                  )}
                >
                  {option.buttonLabel}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      <Toast
        key={toast?.id}
        type={toast?.type}
        message={toast?.message}
        onClose={() => setToast(null)}
      />

      {activeView ? (
        <div className="flex flex-col gap-4">
          <BackButton onClick={() => setActiveView("")} label="Back to partner options" />

          {activeView === "service" && (
            <ServiceFlow
              services={services}
              isLoading={isLoadingPartnerData}
              onBack={() => setActiveView("")}
              onCreateService={handleCreateService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
            />
          )}

          {activeView === "package" && (
            <PackageFlow
              packages={packages}
              services={services}
              isLoading={isLoadingPartnerData}
              onBack={() => setActiveView("")}
              onCreatePackage={handleCreatePackage}
              onUpdatePackage={handleUpdatePackage}
              onSwitchToService={() => setActiveView("service")}
            />
          )}
        </div>
      ) : (
        renderEntryScreen()
      )}
    </div>
  );
}
