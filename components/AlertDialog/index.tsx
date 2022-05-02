import { FC, ReactNode } from "react";
import { proxy, useSnapshot } from "valtio";
import Button from "../Button";
import Flex from "../Flex";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./primitive";

export interface AlertState {
  isOpen: boolean;
  title?: string;
  body?: ReactNode;
  cancelText?: string;
  confirmNode?: ReactNode;
  onConfirm?: () => any;
  onCancel?: () => any;
}

export const alertState = proxy<AlertState>({
  isOpen: false,
});

const Alert: FC = () => {
  const {
    title = "Are you sure?",
    isOpen,
    body,
    cancelText,
    confirmNode = "Ok",
    onCancel,
    onConfirm,
  } = useSnapshot(alertState);
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={value => (alertState.isOpen = value)}
    >
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{body}</AlertDialogDescription>
        <Flex css={{ justifyContent: "flex-end", gap: "$3" }}>
          {cancelText && (
            <AlertDialogCancel asChild>
              <Button css={{ minWidth: "$16" }} outline onClick={onCancel}>
                {cancelText}
              </Button>
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button
              css={{ minWidth: "$16" }}
              variant="primary"
              onClick={async () => {
                await onConfirm?.();
                alertState.isOpen = false;
              }}
            >
              {confirmNode}
            </Button>
          </AlertDialogAction>
        </Flex>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
