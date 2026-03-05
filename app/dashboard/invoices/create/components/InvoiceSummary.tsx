"use client";

import {
    Card,
    Heading,
    VStack,
    HStack,
    Text,
    Box,
    Separator,
    Input,
    IconButton,
} from "@chakra-ui/react";
import { LuRotateCcw } from "react-icons/lu";

interface InvoiceSummaryProps {
    subtotal: number;
    returns: number;
    netSubtotal: number;
    discount: number;
    discountAmount: number | null;
    total: number;
    isDiscountEditing: boolean;
    onDiscountAmountChange: (value: number | null) => void;
    onDiscountEditToggle: () => void;
    onDiscountReset: () => void;
}

export default function InvoiceSummary({
    subtotal,
    returns,
    netSubtotal,
    discount,
    discountAmount,
    total,
    isDiscountEditing,
    onDiscountAmountChange,
    onDiscountEditToggle,
    onDiscountReset,
}: InvoiceSummaryProps) {
    return (
        <Card.Root border="1px solid" borderColor="border.default" bg="bg.surface" position="sticky" top="80px">
            <Card.Header p={5} pb={0}>
                <Heading size="sm" fontWeight="semibold">Summary</Heading>
            </Card.Header>
            <Card.Body p={5}>
                <VStack gap={3} align="stretch">
                    <HStack justify="space-between">
                        <Text color="fg.muted" fontSize="sm">Subtotal</Text>
                        <Text fontWeight="medium">QAR {subtotal.toLocaleString()}</Text>
                    </HStack>
                    {returns > 0 && (
                        <HStack justify="space-between">
                            <Text color="red.600" fontSize="sm">Returns</Text>
                            <Text fontWeight="medium" color="red.600">-QAR {returns.toLocaleString()}</Text>
                        </HStack>
                    )}
                    {returns > 0 && (
                        <HStack justify="space-between">
                            <Text color="fg.muted" fontSize="sm">Net Subtotal</Text>
                            <Text fontWeight="medium">QAR {netSubtotal.toLocaleString()}</Text>
                        </HStack>
                    )}
                    <Box
                        border="2px solid"
                        borderColor={discount > 0 ? "blue.300" : "gray.200"}
                        borderRadius="md"
                        p={3}
                        bg={discount > 0 ? "blue.50" : "gray.50"}
                    >
                        <HStack justify="space-between" align="center">
                            <HStack gap={2} align="center">
                                <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
                                    Discount
                                </Text>
                                {discountAmount !== null && discountAmount > 0 && (
                                    <IconButton
                                        variant="ghost"
                                        size="xs"
                                        aria-label="Reset discount"
                                        onClick={onDiscountReset}
                                        title="Remove discount"
                                    >
                                        <LuRotateCcw />
                                    </IconButton>
                                )}
                            </HStack>
                            {isDiscountEditing ? (
                                <HStack gap={1} align="center">
                                    <Text fontSize="sm" color="fg.muted" fontWeight="medium">QAR </Text>
                                    <Input
                                        type="number"
                                        size="sm"
                                        w="100px"
                                        value={discountAmount !== null ? discountAmount : ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                onDiscountAmountChange(null);
                                            } else {
                                                const numValue = parseFloat(value);
                                                if (!isNaN(numValue)) {
                                                    onDiscountAmountChange(numValue);
                                                }
                                            }
                                        }}
                                        onBlur={onDiscountEditToggle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                onDiscountEditToggle();
                                            }
                                            if (e.key === 'Escape') {
                                                onDiscountAmountChange(null);
                                                onDiscountEditToggle();
                                            }
                                        }}
                                        autoFocus
                                        min="0"
                                        step="0.01"
                                    />
                                </HStack>
                            ) : (
                                <Text
                                    fontWeight="bold"
                                    fontSize="md"
                                    cursor="pointer"
                                    color={discount > 0 ? "blue.600" : "gray.600"}
                                    _hover={{ color: "blue.700", textDecoration: "underline" }}
                                    onClick={onDiscountEditToggle}
                                    title="Click to edit discount amount"
                                >
                                    QAR {discount.toLocaleString()}
                                </Text>
                            )}
                        </HStack>
                    </Box>
                    <Separator />
                    <HStack justify="space-between">
                        <Text fontWeight="semibold">Total</Text>
                        <Text fontWeight="bold" fontSize="xl" color="blue.600">QAR {total.toLocaleString()}</Text>
                    </HStack>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}

