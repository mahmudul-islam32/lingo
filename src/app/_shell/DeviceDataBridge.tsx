"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { onDeviceDataReplaced } from "@/features/auth";
import { queryKeys } from "@/lib/query";

/**
 * After the device's data changed under the app (guest → account switch, PLT-013; a sync
 * pull, PLT-015) the cached reads are refreshed, so Learn, Practice and Profile update
 * without a reload. Inactive queries too (`refetchType: "all"`, as `useInvalidateProgress`).
 */
export function DeviceDataBridge() {
  const client = useQueryClient();
  useEffect(
    () =>
      onDeviceDataReplaced(() => {
        for (const queryKey of [
          queryKeys.progressAll(),
          queryKeys.settings(),
          queryKeys.profile(),
          queryKeys.hearts(),
        ]) {
          void client.invalidateQueries({ queryKey, refetchType: "all" });
        }
      }),
    [client],
  );
  return null;
}
