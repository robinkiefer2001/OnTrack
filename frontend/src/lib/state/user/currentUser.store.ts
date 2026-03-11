import { writable } from "svelte/store";
import { customerEmployeeList } from "$lib/data/mock/projectDataSource";

export interface CurrentUser {
  employeeID: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  customerID: number;
}

function asCurrentUser(employee: (typeof customerEmployeeList)[number]): CurrentUser {
  return {
    employeeID: employee.employeeID,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone ?? "",
    jobTitle: employee.jobTitle ?? "",
    department: employee.department ?? "",
    customerID: employee.customerID,
  };
}

function resolveStoredUser(raw: unknown): CurrentUser | null {
  if (!raw || typeof raw !== "object") return null;

  const parsed = raw as Partial<CurrentUser>;
  const byId = customerEmployeeList.find((e) => e.employeeID === parsed.employeeID);
  if (byId) return asCurrentUser(byId);

  const byEmail = parsed.email
    ? customerEmployeeList.find((e) => e.email.toLowerCase() === String(parsed.email).toLowerCase())
    : null;
  if (byEmail) return asCurrentUser(byEmail);

  const byNameAndCustomer =
    parsed.firstName && parsed.lastName && parsed.customerID != null
      ? customerEmployeeList.find(
          (e) =>
            e.customerID === parsed.customerID &&
            e.firstName === parsed.firstName &&
            e.lastName === parsed.lastName,
        )
      : null;

  return byNameAndCustomer ? asCurrentUser(byNameAndCustomer) : null;
}

function getInitialUser(): CurrentUser {
  const fallbackUser = asCurrentUser(customerEmployeeList[0]);

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const resolved = resolveStoredUser(JSON.parse(stored));
        if (resolved) return resolved;
      } catch {
        // Fall back to first employee
      }
    }
  }

  return fallbackUser;
}

function createCurrentUserStore() {
  const { subscribe, set, update } = writable<CurrentUser>(getInitialUser());

  return {
    subscribe,
    set: (user: CurrentUser) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }
      set(user);
    },
    update,
    switchUser: (user: CurrentUser) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(user));
      }
      set(user);
    },
    reset: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUser");
      }
      set(asCurrentUser(customerEmployeeList[0]));
    },
  };
}

export const currentUser = createCurrentUserStore();

export function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
