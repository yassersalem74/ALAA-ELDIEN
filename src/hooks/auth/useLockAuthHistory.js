import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const AUTH_PATHS = ["/login", "/signup"];

const getPath = ({ pathname, search, hash }) => `${pathname}${search}${hash}`;

export const useLockAuthHistory = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const currentPath = getPath(location);
  const isAuthPage = AUTH_PATHS.includes(location.pathname);
  const shouldLockHistory = isAuthenticated || isAuthPage;
  const lockedPathRef = useRef(currentPath);

  useEffect(() => {
    if (!shouldLockHistory || navigationType === "POP") return;

    lockedPathRef.current = currentPath;
  }, [currentPath, navigationType, shouldLockHistory]);

  useEffect(() => {
    if (!shouldLockHistory || navigationType !== "POP") return;

    const lockedPath = lockedPathRef.current;

    if (currentPath !== lockedPath) {
      navigate(lockedPath, { replace: true });
    }
  }, [currentPath, navigate, navigationType, shouldLockHistory]);
};
