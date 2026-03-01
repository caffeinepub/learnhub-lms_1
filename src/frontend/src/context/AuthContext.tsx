import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface AuthContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  isAdmin: boolean;
  isLoadingProfile: boolean;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
  userProfile: null,
  setUserProfile: () => {},
  isAdmin: false,
  isLoadingProfile: false,
  refetchProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetchProfile = () => setFetchTrigger((t) => t + 1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchTrigger is intentional
  useEffect(() => {
    if (!actor || isFetching || !identity) {
      if (!identity) {
        setUserProfile(null);
        setIsAdmin(false);
      }
      return;
    }

    setIsLoadingProfile(true);
    Promise.all([actor.getCallerUserProfile(), actor.isCallerAdmin()])
      .then(([profile, adminStatus]) => {
        setUserProfile(profile);
        setIsAdmin(adminStatus);
      })
      .catch(() => {
        setUserProfile(null);
        setIsAdmin(false);
      })
      .finally(() => setIsLoadingProfile(false));
  }, [actor, isFetching, identity, fetchTrigger]);

  return (
    <AuthContext.Provider
      value={{
        userProfile,
        setUserProfile,
        isAdmin,
        isLoadingProfile,
        refetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
