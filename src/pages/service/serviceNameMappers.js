import { serviceCategories } from "../../components/Service-Page/servicePageData";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeComparableText = (value) =>
  normalizeText(value)
    .replace(/[_-]+/g, " ")
    .toLowerCase();

const slugify = (value) =>
  normalizeComparableText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const firstPresentValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const getServiceNameCategoryValue = (item) =>
  firstPresentValue(
    item?.categoryName,
    item?.CategoryName,
    item?.category,
    item?.Category,
    item?.serviceCategory,
    item?.ServiceCategory,
    item?.categoryDto?.name,
    item?.categoryDTO?.name,
    item?.category?.name
  );

export const normalizeServiceName = (item) => {
  const label = normalizeText(
    firstPresentValue(
      item?.name,
      item?.Name,
      item?.serviceName,
      item?.ServiceName,
      item?.title,
      item?.Title,
      item?.label,
      item?.Label,
      item?.nameEn,
      item?.NameEn
    )
  );
  const id = normalizeText(
    firstPresentValue(
      item?.id,
      item?.Id,
      item?.serviceNameId,
      item?.ServiceNameId,
      item?.serviceNameID,
      item?.value,
      label ? slugify(label) : ""
    )
  );

  return {
    id,
    label,
    categoryName: normalizeText(getServiceNameCategoryValue(item)),
    raw: item,
  };
};

export const normalizeServiceNameList = (items) => {
  const serviceNameMap = new Map();

  (Array.isArray(items) ? items : [])
    .map(normalizeServiceName)
    .filter((item) => item.id && item.label)
    .forEach((item) => {
      const key = item.id || slugify(item.label);

      if (!serviceNameMap.has(key)) {
        serviceNameMap.set(key, item);
      }
    });

  return [...serviceNameMap.values()].sort((first, second) =>
    first.label.localeCompare(second.label)
  );
};

export const doesServiceNameMatchCategory = (serviceName, categorySlug) => {
  const category = serviceCategories.find((item) => item.slug === categorySlug);

  if (!category || !serviceName.categoryName) return false;

  const categoryAliases = [
    category.slug,
    category.id,
    category.apiName,
    category.title,
    category.title.replace(/&/g, "and"),
  ].map(normalizeComparableText);
  const serviceCategory = normalizeComparableText(serviceName.categoryName);

  return categoryAliases.some(
    (alias) => alias && (serviceCategory === alias || serviceCategory.includes(alias))
  );
};

export const filterServiceNamesByCategory = (serviceNames, categorySlug) => {
  const hasCategoryMetadata = serviceNames.some((item) => item.categoryName);

  if (!hasCategoryMetadata) return serviceNames;

  return serviceNames.filter((item) =>
    doesServiceNameMatchCategory(item, categorySlug)
  );
};

export const findServiceNameById = (serviceNames, serviceNameId) =>
  serviceNames.find(
    (item) =>
      String(item.id) === String(serviceNameId) ||
      slugify(item.label) === String(serviceNameId)
  );
