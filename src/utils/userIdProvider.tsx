const getMyUserId = (): string | null => {
  const user = localStorage.getItem("currentUser");
  if (!user) return null;

  try {
    const parsed = JSON.parse(user);
    return parsed.id || null;
  } catch {
    return null;
  }
};

export default getMyUserId;
