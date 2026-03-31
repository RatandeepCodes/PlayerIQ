import { useEffect, useState } from "react";

import { getHealth } from "../api/client.js";

export function useBackendHealth(enabled = true) {
  const [health, setHealth] = useState({
    status: enabled ? "checking" : "idle",
    message: enabled ? "Checking backend" : "Not requested",
  });

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    async function loadHealth() {
      if (!enabled) {
        return;
      }

      try {
        const response = await getHealth();
        if (!isMounted) {
          return;
        }

        setHealth({
          status: response.status === "ok" ? "online" : "degraded",
          message:
            response.database === "connected"
              ? "Backend and database online"
              : "Backend online, database offline",
        });
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setHealth({
          status: "offline",
          message: "Backend unreachable",
        });
      }
    }

    async function pollHealth() {
      await loadHealth();
      if (isMounted && document.visibilityState === "visible") {
        timerId = window.setTimeout(pollHealth, 30000);
      }
    }

    function handleVisibilityChange() {
      if (!isMounted || !enabled) {
        return;
      }

      if (document.visibilityState === "visible") {
        window.clearTimeout(timerId);
        timerId = window.setTimeout(pollHealth, 250);
      } else {
        window.clearTimeout(timerId);
      }
    }

    pollHealth();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      window.clearTimeout(timerId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled]);

  return health;
}
