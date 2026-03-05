"use client";

import {
    Dialog,
    Portal,
    Button,
    VStack,
    HStack,
    Text,
    Box,
    CloseButton,
} from "@chakra-ui/react";
import { LuSend } from "react-icons/lu";

interface SendInvoiceDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    clientName: string;
    clientPhone: string;
    total: number;
}

export default function SendInvoiceDialog({
    isOpen,
    onClose,
    onConfirm,
    clientName,
    clientPhone,
    total,
}: SendInvoiceDialogProps) {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => {
            if (!e.open) {
                onClose();
            }
        }}>
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.600" />
                <Dialog.Positioner>
                    <Dialog.Content bg="bg.surface" borderRadius="xl" mx={4}>
                        <Dialog.Header p={6} pb={4}>
                            <Dialog.Title fontWeight="semibold">Send Invoice</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body px={6} pb={6}>
                            <VStack align="stretch" gap={4}>
                                <Text color="fg.muted">
                                    Ready to send this invoice?
                                </Text>
                                <Box bg="blue.500/10" p={4} borderRadius="lg">
                                    <HStack justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="fg.muted">Client</Text>
                                        <Text fontSize="sm" fontWeight="medium">{clientName || "Not specified"}</Text>
                                    </HStack>
                                    {clientPhone && (
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" color="fg.muted">Phone</Text>
                                            <Text fontSize="sm" fontWeight="medium">{clientPhone}</Text>
                                        </HStack>
                                    )}
                                    <HStack justify="space-between">
                                        <Text fontSize="sm" color="fg.muted">Total</Text>
                                        <Text fontSize="sm" fontWeight="bold" color="blue.600">QAR {total.toLocaleString()}</Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        </Dialog.Body>
                        <Dialog.Footer p={6} pt={4} gap={3}>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">
                                    Cancel
                                </Button>
                            </Dialog.ActionTrigger>
                            <Button
                                colorPalette="blue"
                                onClick={onConfirm}
                            >
                                <LuSend /> Send Invoice
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

