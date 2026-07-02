import axiosInstance from "@/conf/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  name: string;
  code: string;
}

export interface Service {
  id: number;
  name: string;
  code: string;
}

export interface Agency {
  id: number;
  name: string;
  code: string;
  company: Company;
  services: Service[];
}

export interface AgencyRef {
  id: number;
  name: string;
  code: string;
}

export interface ServiceRef {
  id: number;
  name: string;
  code: string;
}

export interface AdminUser {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  department: string | null;
  matricule: string | null;
  roles: string[];
  lastLoginAt: string | null;
  defaultAgency: AgencyRef | null;
  defaultService: ServiceRef | null;
}

export interface Personnel {
  id: number;
  nom: string;
  prenoms: string;
  matricule: string;
  codeBancaire: string | null;
  centre: { id: number; code: string; codeSage: string | null } | null;
  user: { id: number; username: string; displayName: string | null } | null;
}

export interface PersonnelPayload {
  nom: string;
  prenoms: string;
  matricule: string;
  codeBancaire?: string;
  centreId?: number;
  userId?: number;
}

export interface Centre {
  id: number;
  code: string;
  companyCode: string;
  codeSage: string | null;
  responsable: string | null;
  agency: { id: number; code: string; name: string };
  service: { id: number; code: string; name: string };
}

export interface CentrePayload {
  agencyId: number;
  serviceId: number;
  code: string;
  companyCode: string;
  codeSage?: string;
  responsable?: string;
}

// ── Companies ──────────────────────────────────────────────────────────────

export const fetchCompanies = async (): Promise<Company[]> => {
  const res = await axiosInstance.get("/admin/companies");
  return res.data;
};

export const createCompany = async (data: { name: string; code: string }): Promise<Company> => {
  const res = await axiosInstance.post("/admin/companies", data);
  return res.data;
};

export const updateCompany = async (id: number, data: { name: string; code: string }): Promise<Company> => {
  const res = await axiosInstance.put(`/admin/companies/${id}`, data);
  return res.data;
};

export const deleteCompany = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/companies/${id}`);
};

// ── Services ───────────────────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> => {
  const res = await axiosInstance.get("/admin/services");
  return res.data;
};

export const createService = async (data: { name: string; code: string }): Promise<Service> => {
  const res = await axiosInstance.post("/admin/services", data);
  return res.data;
};

export const updateService = async (id: number, data: { name: string; code: string }): Promise<Service> => {
  const res = await axiosInstance.put(`/admin/services/${id}`, data);
  return res.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/services/${id}`);
};

// ── Personnel ──────────────────────────────────────────────────────────────

export const fetchPersonnel = async (): Promise<Personnel[]> => {
  const res = await axiosInstance.get("/admin/personnel");
  return res.data;
};

export const createPersonnel = async (data: PersonnelPayload): Promise<Personnel> => {
  const res = await axiosInstance.post("/admin/personnel", data);
  return res.data;
};

export const updatePersonnel = async (id: number, data: PersonnelPayload): Promise<Personnel> => {
  const res = await axiosInstance.put(`/admin/personnel/${id}`, data);
  return res.data;
};

export const deletePersonnel = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/personnel/${id}`);
};

// ── Centres ────────────────────────────────────────────────────────────────

export const fetchCentres = async (): Promise<Centre[]> => {
  const res = await axiosInstance.get("/admin/centres");
  return res.data;
};

export const createCentre = async (data: CentrePayload): Promise<Centre> => {
  const res = await axiosInstance.post("/admin/centres", data);
  return res.data;
};

export const updateCentre = async (id: number, data: CentrePayload): Promise<Centre> => {
  const res = await axiosInstance.put(`/admin/centres/${id}`, data);
  return res.data;
};

export const deleteCentre = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/centres/${id}`);
};

// ── Agencies ───────────────────────────────────────────────────────────────

export const fetchAgencies = async (): Promise<Agency[]> => {
  const res = await axiosInstance.get("/admin/agencies");
  return res.data;
};

export const createAgency = async (data: {
  name: string;
  code: string;
  companyId: number;
  serviceIds: number[];
}): Promise<Agency> => {
  const res = await axiosInstance.post("/admin/agencies", data);
  return res.data;
};

export const updateAgency = async (
  id: number,
  data: { name: string; code: string; companyId: number; serviceIds: number[] },
): Promise<Agency> => {
  const res = await axiosInstance.put(`/admin/agencies/${id}`, data);
  return res.data;
};

export const deleteAgency = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/agencies/${id}`);
};

// ── Users ──────────────────────────────────────────────────────────────────

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await axiosInstance.get("/admin/users");
  return res.data;
};

export interface AdminUserDetail extends AdminUser {
  agencyIds: number[];
  serviceIds: number[];
}

export const fetchAdminUserDetail = async (userId: number): Promise<AdminUserDetail> => {
  const res = await axiosInstance.get(`/admin/users/${userId}`);
  return res.data;
};

export const updateUserRoles = async (userId: number, roles: string[]): Promise<void> => {
  await axiosInstance.put(`/admin/users/${userId}/roles`, { roles });
};

export const updateUserMatricule = async (userId: number, matricule: string): Promise<void> => {
  await axiosInstance.put(`/admin/users/${userId}/matricule`, { matricule });
};

// ── Actions ────────────────────────────────────────────────────────────────

export interface ActionDef {
  id: number;
  actionKey: string;
  label: string;
  category: string | null;
  sortOrder: number;
}

export const fetchActionDefs = async (): Promise<ActionDef[]> => {
  const res = await axiosInstance.get("/admin/actions");
  return res.data;
};

export const createActionDef = async (data: Omit<ActionDef, "id">): Promise<ActionDef> => {
  const res = await axiosInstance.post("/admin/actions", data);
  return res.data;
};

export const updateActionDef = async (id: number, data: Omit<ActionDef, "id">): Promise<ActionDef> => {
  const res = await axiosInstance.put(`/admin/actions/${id}`, data);
  return res.data;
};

export const deleteActionDef = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/actions/${id}`);
};

// ── Modules & Menus ────────────────────────────────────────────────────────

export interface AppSubMenu {
  id: number;
  label: string;
  slug: string;
}

export interface AppMenu {
  id: number;
  label: string;
  slug: string;
  subMenus: AppSubMenu[];
}

export interface AppModule {
  id: number;
  label: string;
  slug: string;
  menus: AppMenu[];
}

export const fetchModules = async (): Promise<AppModule[]> => {
  const res = await axiosInstance.get("/admin/modules");
  return res.data;
};

// ── Permissions ────────────────────────────────────────────────────────────

export interface AgencyScope {
  agencyId: number;
  allServices: boolean;
  serviceIds: number[];
}

export interface UserPermission {
  id: number;
  company: Company;
  resourceType: "module" | "menu";
  resourceId: number;
  resourceLabel: string;
  actions: string[];
  scopeAll: boolean;
  agencyScopes: AgencyScope[];
}

export interface PermissionPayload {
  companyId: number;
  resourceType: "module" | "menu";
  resourceId: number;
  actions: string[];
  scopeAll: boolean;
  agencyScopes: AgencyScope[];
}

export const fetchUserPermissions = async (userId: number): Promise<UserPermission[]> => {
  const res = await axiosInstance.get(`/admin/users/${userId}/permissions`);
  return res.data;
};

export const createUserPermission = async (userId: number, data: PermissionPayload): Promise<UserPermission> => {
  const res = await axiosInstance.post(`/admin/users/${userId}/permissions`, data);
  return res.data;
};

export const updateUserPermission = async (id: number, data: PermissionPayload): Promise<UserPermission> => {
  const res = await axiosInstance.put(`/admin/permissions/${id}`, data);
  return res.data;
};

export const deleteUserPermission = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/permissions/${id}`);
};

export type CopyMode = "replace" | "merge";

export const copyPermissionsFromUser = async (
  targetUserId: number,
  sourceUserId: number,
  mode: CopyMode,
): Promise<UserPermission[]> => {
  const res = await axiosInstance.post(`/admin/users/${targetUserId}/copy-from/${sourceUserId}`, { mode });
  return res.data;
};

export const applyPermissionTemplate = async (
  userId: number,
  templateId: number,
  mode: CopyMode,
): Promise<UserPermission[]> => {
  const res = await axiosInstance.post(`/admin/users/${userId}/apply-template/${templateId}`, { mode });
  return res.data;
};

// ── Permission Templates ───────────────────────────────────────────────────

export interface PermissionTemplateItem {
  id: number;
  company: Company;
  resourceType: "module" | "menu";
  resourceId: number;
  resourceLabel: string;
  actions: string[];
  scopeAll: boolean;
  agencyScopes: AgencyScope[];
}

export interface PermissionTemplate {
  id: number;
  name: string;
  description: string | null;
  items: PermissionTemplateItem[];
}

export interface PermissionTemplatePayload {
  name: string;
  description?: string;
  items: PermissionPayload[];
}

export const fetchPermissionTemplates = async (): Promise<PermissionTemplate[]> => {
  const res = await axiosInstance.get("/admin/permission-templates");
  return res.data;
};

export const fetchPermissionTemplate = async (id: number): Promise<PermissionTemplate> => {
  const res = await axiosInstance.get(`/admin/permission-templates/${id}`);
  return res.data;
};

export const createPermissionTemplate = async (data: PermissionTemplatePayload): Promise<PermissionTemplate> => {
  const res = await axiosInstance.post("/admin/permission-templates", data);
  return res.data;
};

export const updatePermissionTemplate = async (
  id: number,
  data: PermissionTemplatePayload,
): Promise<PermissionTemplate> => {
  const res = await axiosInstance.put(`/admin/permission-templates/${id}`, data);
  return res.data;
};

export const deletePermissionTemplate = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/admin/permission-templates/${id}`);
};
