import { User } from "../types/users";

const getInstructorName = (): string | null => {
  const user = localStorage.getItem("currentUser");
  if (!user) return null;

  try {
    const parsed: User = JSON.parse(user);
    return parsed.name || null;
  } catch {
    return null;
  }
};

export default getInstructorName;
