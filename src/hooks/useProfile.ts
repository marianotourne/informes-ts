import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "../api/profilesApi";
import { useAuth } from "./useAuth";

// Logged-in user's profile. isInterno is false while loading, so internal-only UI
// stays hidden until the role is known.
export function useProfile() {
  const { user, loading: authLoading } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  return {
    profile: profileQuery.data ?? null,
    isInterno: profileQuery.data?.rol === "interno",
    isLoading: authLoading || (!!user && profileQuery.isLoading),
  };
}
