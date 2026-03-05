"use client";

import {
    Dialog,
    Portal,
    Button,
    Text,
    CloseButton,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

interface DiscardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DiscardDialog({
    isOpen,
    onClose,
    onConfirm,
}: DiscardDialogProps) {
    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(e) => {
                if (!e.open) {
                    onClose();
                }
            }}
            role="alertdialog"
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="bg.surface" borderRadius="xl" mx={4}>
                        <Dialog.Header p={6} pb={4}>
                            <Dialog.Title fontWeight="semibold">Discard Changes</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body px={6} pb={6}>
                            <Text color="fg.muted">
                                Are you sure you want to discard this invoice? All unsaved changes will be lost.
                            </Text>
                        </Dialog.Body>
                        <Dialog.Footer p={6} pt={4} gap={3}>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">
                                    Keep Editing
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette="red"
                                onClick={onConfirm}
                            >
                                <LuX /> Discard
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild position="absolute" top={4} right={4}>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}

