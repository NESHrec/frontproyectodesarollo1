export type InternalRole = "recepcion" | "medico" | "admin" | "paciente";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel: string;
};

export type NavigationGroup = {
  role: InternalRole;
  label: string;
  description: string;
  items: NavigationItem[];
};
