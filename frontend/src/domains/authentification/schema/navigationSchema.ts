export interface NavigationData {
  societes: { id: number; nom: string }[];
  data_scope: {
    userAgenceId: number | null;
    userServiceId: number | null;
  };
  modules: {
    id: number;
    nom: string;
    menu: MenuItem[];
  }[];
}

export interface MenuItem {
  id: number;
  nom: string;
  route: string | null;
  actions: string[];
  scope: {
    scopeAll: boolean;
    agencyScopes: number[];
  };
  "sous-menu": MenuItem[];
}
