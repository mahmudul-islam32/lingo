/**
 * Shared presentational UI primitives (CTO-004). Import from `@/components/ui`.
 * No stores and no data access here (ARCHITECTURE §2 rule 5). Adding a component is
 * open to every dev; changing an existing one needs a note in the PR description.
 */
export { cn } from "./cn";
export { BRAND_HEX, THEMES, type Theme } from "./tokens";
export { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from "./Button";
export { IconButton, type IconButtonProps, type IconButtonSize } from "./IconButton";
export { Card, type CardElement, type CardPadding, type CardProps, type CardTone } from "./Card";
export {
  ProgressBar,
  type ProgressBarProps,
  type ProgressSize,
  type ProgressTone,
} from "./ProgressBar";
export { Dialog, Modal, type DialogProps, type ModalProps } from "./Dialog";
export {
  Toast,
  ToastProvider,
  useToast,
  type ToastAction,
  type ToastApi,
  type ToastOptions,
  type ToastProps,
  type ToastProviderProps,
  type ToastTone,
} from "./Toast";
export { HeartIcon, type GameIconSize, type HeartIconProps } from "./HeartIcon";
export { XpBadge, type XpBadgeProps } from "./XpBadge";
export { Skeleton, type SkeletonProps, type SkeletonShape } from "./Skeleton";
export { Spinner, type SpinnerProps, type SpinnerSize } from "./Spinner";
export { VisuallyHidden, type VisuallyHiddenProps } from "./VisuallyHidden";
export { BoltIcon, CheckIcon, CloseIcon, CrossIcon, type IconProps } from "./icons";
export { Lumi, LUMI_SIZE_PX, type LumiProps, type LumiSize } from "./Lumi";
export { LUMI_POSES, type LumiPose } from "./lumi-poses";
