"use client";

import { Card, Heading, SimpleGrid, Box, VStack, HStack, Text } from "@chakra-ui/react";

interface PaymentMethodSectionProps {
    paymentMethod: 'cash' | 'card' | 'bank-transfer' | 'Fawran' | 'Pending' | undefined;
    onPaymentMethodChange: (method: 'cash' | 'card' | 'bank-transfer' | 'Fawran' | 'Pending') => void;
}

export default function PaymentMethodSection({
    paymentMethod,
    onPaymentMethodChange,
}: PaymentMethodSectionProps) {
    const methods: Array<{ value: 'cash' | 'card' | 'bank-transfer' | 'Fawran' | 'Pending'; label: string; description: string }> = [
        { value: 'cash', label: 'Cash', description: 'Cash payment' },
        { value: 'card', label: 'Card', description: 'Credit/Debit card' },
        { value: 'bank-transfer', label: 'Bank Transfer', description: 'Bank wire transfer' },
        { value: 'Fawran', label: 'Fawran', description: 'Fawran payment' },
        { value: 'Pending', label: 'Pending', description: 'Payment pending' },
    ];

    return (
        <Card.Root border="1px solid" borderColor="border.default" bg="bg.surface">
            <Card.Header p={5} pb={0}>
                <Heading size="sm" fontWeight="semibold">Payment Method</Heading>
            </Card.Header>
            <Card.Body p={5}>
                <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} gap={3}>
                    {methods.map((method) => (
                        <Box
                            key={method.value}
                            as="button"
                            onClick={() => onPaymentMethodChange(method.value)}
                            p={4}
                            border="2px solid"
                            borderColor={paymentMethod === method.value ? 'blue.500' : 'border.default'}
                            borderRadius="lg"
                            bg={paymentMethod === method.value ? 'brand.muted' : 'bg.surface'}
                            _hover={{ borderColor: 'blue.400', bg: paymentMethod === method.value ? 'brand.muted' : 'bg.subtle' }}
                            cursor="pointer"
                            textAlign="left"
                            transition="all 0.2s"
                        >
                            <VStack align="start" gap={1}>
                                <HStack gap={2} align="center">
                                    <Box
                                        w={4}
                                        h={4}
                                        borderRadius="full"
                                        border="2px solid"
                                        borderColor={paymentMethod === method.value ? 'blue.500' : 'border.default'}
                                        bg={paymentMethod === method.value ? 'blue.500' : 'bg.surface'}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {paymentMethod === method.value && (
                                            <Box w={2} h={2} borderRadius="full" bg="bg.surface" />
                                        )}
                                    </Box>
                                    <Text fontWeight="semibold">{method.label}</Text>
                                </HStack>
                                <Text fontSize="xs" color="fg.muted" ml={6}>{method.description}</Text>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Card.Body>
        </Card.Root>
    );
}

