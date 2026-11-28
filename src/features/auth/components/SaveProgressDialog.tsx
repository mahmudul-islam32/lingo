"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button, CloseIcon, Dialog, IconButton, Lumi } from "@/components/ui";
import { useOnlineStatus } from "@/lib/offline";
import { AUTH_COPY } from "../messages";
import { closeSaveProgressPrompt, useSaveProgressPromptOpen } from "../save-progress-prompt";
import { PRIMARY_LINK_CLASSES } from "./AccountSwitchResult";

/**
 * The "Save your progress" dialog (PLT-013 criteria 1, 2 and 12), mounted on the tabs.
 * Opens when `offerSaveProgress()` marked it after a lesson. "Not now", Esc and the close
 * button dismiss it and return focus. Closes by itself if the device goes offline.
 */
export function SaveProgressDialog() {
  const open = useSaveProgressPromptOpen();
  const online = useOnlineStatus();
  const createRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (open && !online) closeSaveProgressPrompt();
  }, [open, online]);
  return (
    <Dialog
      open={open && online}
      onClose={closeSaveProgressPrompt}
      title={AUTH_COPY.savePromptTitle}
      description={AUTH_COPY.savePromptText}
      initialFocusRef={createRef}
      actions={
        <>
          <Button variant="secondary" size="lg" fullWidth onClick={closeSaveProgressPrompt}>
            {AUTH_COPY.notNow}
          </Button>
          <Link
            ref={createRef}
            href="/sign-up"
            onClick={closeSaveProgressPrompt}
            className={PRIMARY_LINK_CLASSES}
          >
            {AUTH_COPY.createAccount}
          </Link>
        </>
      }
    >
      <div className="flex justify-center">
        <Lumi pose="happy" size="sm" />
      </div>
      <IconButton
        label={AUTH_COPY.close}
        icon={<CloseIcon />}
        size="lg"
        className="absolute top-2 right-2"
        onClick={closeSaveProgressPrompt}
      />
    </Dialog>
  );
}
