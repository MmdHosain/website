"use client";

import { createContext, useContext, useCallback, useEffect, useRef, useState } from "react";
import { AuthModal } from "../auth/AuthModal";
import { authService } from "../../services/auth.service";

type AccessState = "checking" | "signed-out" | "denied" | "admin" | "error";
const AdminRole = createContext('user');
export const useAdminRole = () => useContext(AdminRole);

export function AdminAccess({ children, lang, dict }: { children: React.ReactNode; lang: string; dict: any }) {
  const isFa = lang === "fa";
  const [access, setAccess] = useState<AccessState>("checking");
  const [loginOpen, setLoginOpen] = useState(false);
  const [role, setRole] = useState('user');
  const verification = useRef(0);

  const checkAccess = useCallback(async () => {
    const attempt = ++verification.current;
    const token = authService.getToken();
    if (!token) {
      setAccess("signed-out");
      return;
    }
    setAccess((current) => current === "admin" ? current : "checking");
    try {
      const user = await authService.me();
      if (attempt === verification.current && token === authService.getToken()) {
        setRole(user.role);
        setAccess(["admin", "staff_orders", "staff_catalog", "staff_blog"].includes(user.role) ? "admin" : "denied");
      }
    } catch (error) {
      if (attempt !== verification.current) return;
      const status = (error as { status?: number }).status;
      if (status === 401) {
        void authService.logout();
        setAccess("signed-out");
      } else {
        setAccess("error");
      }
    }
  }, []);

  useEffect(() => {
    void checkAccess();
    const recheck = () => { void checkAccess(); };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === "ariwatch_token" || event.key === null) recheck();
    };
    window.addEventListener("ariwatch:auth", recheck);
    window.addEventListener("focus", recheck);
    window.addEventListener("storage", storageChanged);
    return () => {
      verification.current++;
      window.removeEventListener("ariwatch:auth", recheck);
      window.removeEventListener("focus", recheck);
      window.removeEventListener("storage", storageChanged);
    };
  }, [checkAccess]);

  return (
    <div className="pt-28 md:pt-36 pb-12 bg-gray-50">
      {access === "admin" ? (
        <>
          <div className="flex justify-end px-6 md:px-10 pb-4">
            <button type="button" onClick={() => { void authService.logout(); }} className="text-xs font-bold text-ariwatch-red hover:underline">
              {isFa ? "خروج از حساب" : "Sign out"}
            </button>
          </div>
          <AdminRole.Provider value={role}>{children}</AdminRole.Provider>
        </>
      ) : (
        <div className="max-w-lg mx-auto my-12 px-6 py-12 bg-white border border-gray-200 text-center">
          <h1 className="font-serif text-2xl mb-5">{isFa ? "مدیریت فروشگاه" : "Store administration"}</h1>
          <p className="text-sm text-gray-600 leading-7" role="status">
            {access === "checking" ? (isFa ? "در حال بررسی دسترسی…" : "Checking access…") :
              access === "denied" ? (isFa ? "این حساب دسترسی مدیریت ندارد. با حساب مدیر وارد شوید." : "This account does not have admin access. Sign in with an administrator account.") :
                access === "error" ? (isFa ? "بررسی دسترسی انجام نشد. اتصال خود را بررسی و دوباره تلاش کنید." : "We could not verify your access. Check your connection and try again.") :
                  (isFa ? "برای دسترسی به مدیریت، وارد حساب مدیر شوید." : "Sign in with an administrator account to continue.")}
          </p>
          {access === "error" && (
            <button type="button" onClick={() => void checkAccess()} className="mt-6 bg-ariwatch-black text-white px-6 py-3 text-sm">
              {isFa ? "تلاش دوباره" : "Try again"}
            </button>
          )}
          {(access === "signed-out" || access === "denied") && (
            <button type="button" onClick={() => { if (access === "denied") void authService.logout(); setLoginOpen(true); }} className="mt-6 bg-ariwatch-black text-white px-6 py-3 text-sm">
              {isFa ? "ورود به حساب" : "Sign in"}
            </button>
          )}
        </div>
      )}
      <AuthModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} dict={dict} isFa={isFa} onSuccess={() => { void checkAccess(); }} />
    </div>
  );
}
