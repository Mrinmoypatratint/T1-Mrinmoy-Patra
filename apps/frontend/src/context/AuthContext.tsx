import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import type { User } from "../types";

const ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS || "admin@example.com"
)
  .split(",")
  .map((e: string) => e.trim().toLowerCase());

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

async function ensureUserDoc(
  uid: string,
  email: string,
  name: string,
  photoUrl: string | null,
): Promise<User> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    // Promote to admin if applicable
    if (isAdmin && data.role !== "ADMIN") {
      await setDoc(ref, { role: "ADMIN" }, { merge: true });
      data.role = "ADMIN";
    }
    return {
      id: uid,
      email: data.email,
      name: data.name,
      photoUrl: data.photoUrl || null,
      role: data.role,
      createdAt: data.createdAt?.toDate().toISOString() ?? "",
    };
  }

  const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
  const newUser = {
    email,
    name,
    photoUrl,
    role: isAdmin ? "ADMIN" : "USER",
    createdAt: Timestamp.now(),
  };
  await setDoc(ref, newUser);

  return {
    id: uid,
    email,
    name,
    photoUrl,
    role: newUser.role as "USER" | "ADMIN",
    createdAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const appUser = await ensureUserDoc(
            firebaseUser.uid,
            firebaseUser.email ?? "",
            firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "",
            firebaseUser.photoURL,
          );
          setUser(appUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await ensureUserDoc(
        cred.user.uid,
        cred.user.email ?? email,
        cred.user.displayName ?? email.split("@")[0],
        cred.user.photoURL,
      );
      setUser(appUser);
    },
    [],
  );

  const signupWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // ensureUserDoc will be called by onAuthStateChanged, but we also call
      // it here so the user state is ready immediately after signup.
      const appUser = await ensureUserDoc(
        cred.user.uid,
        email,
        name,
        null,
      );
      setUser(appUser);
    },
    [],
  );

  const loginWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const appUser = await ensureUserDoc(
      cred.user.uid,
      cred.user.email ?? "",
      cred.user.displayName ?? cred.user.email?.split("@")[0] ?? "",
      cred.user.photoURL,
    );
    setUser(appUser);
  }, []);

  const logout = useCallback(() => {
    signOut(auth);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
