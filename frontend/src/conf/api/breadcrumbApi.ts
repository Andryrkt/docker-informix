import axiosInstance from "../axios";

export const fetchBreadcrumbs = async (route: string) => {
  const { data } = await axiosInstance.get(
    `/navigation/breadcrumbs?route=${route}`,
  );

  return data;
};

export const fetchBreadcrumbsMock = async (route: string) => {
  await new Promise((res) => setTimeout(res, 300));

  const segments = route.split("/").filter(Boolean);

  const breadcrumbs = [{ title: "Accueil", link: "/" }];

  let path = "";

  segments.forEach((seg, index) => {
    path += `/${seg}`;

    breadcrumbs.push({
      title: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      link: index === segments.length - 1 ? undefined : path,
      is_active: index === segments.length - 1,
    });
  });

  return breadcrumbs;
};
