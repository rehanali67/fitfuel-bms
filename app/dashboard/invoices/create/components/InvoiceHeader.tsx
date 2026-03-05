"use client";

import { HStack, Box, Heading, Text, Button, Flex } from "@chakra-ui/react";
import { LuArrowLeft, LuSave, LuSend } from "react-icons/lu";
import Link from "next/link";
import { IconButton } from "@chakra-ui/react";

interface InvoiceHeaderProps {
    onSaveDraft: () => void;
    onSend: () => void;
    isSaving: boolean;
    isSending: boolean;
}

export default function InvoiceHeader({
    onSaveDraft,
    onSend,
    isSaving,
    isSending,
}: InvoiceHeaderProps) {
    return (
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <HStack gap={4}>
                <Link href="/dashboard/invoices">
                    <IconButton variant="ghost" size="sm" aria-label="Back">
                        <LuArrowLeft />
                    </IconButton>
                </Link>
                <Box>
                    <Heading size="lg" fontWeight="semibold">Create Invoice</Heading>
                    <Text color="fg.muted" fontSize="sm">Fill in the details to create a new invoice</Text>
                </Box>
            </HStack>
            <HStack gap={2} flexWrap="wrap">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSaveDraft}
                    loading={isSaving}
                    loadingText="Saving..."
                >
                    <LuSave /> <Text display={{ base: "none", sm: "inline" }}>Save Draft</Text>
                </Button>
                <Button
                    colorPalette="blue"
                    size="sm"
                    onClick={onSend}
                    loading={isSending}
                    loadingText="Sending..."
                >
                    <LuSend /> <Text display={{ base: "none", sm: "inline" }}>Create & Send</Text>
                </Button>
            </HStack>
        </Flex>
    );
}

