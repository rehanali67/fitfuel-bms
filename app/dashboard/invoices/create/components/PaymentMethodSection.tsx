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
        <Card.Root border="1px solid" borderColor="gray.100" bg="white">
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
                            borderColor={paymentMethod === method.value ? 'blue.500' : 'gray.200'}
                            borderRadius="lg"
                            bg={paymentMethod === method.value ? 'blue.50' : 'white'}
                            _hover={{ borderColor: 'blue.300', bg: paymentMethod === method.value ? 'blue.50' : 'gray.50' }}
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
                                        borderColor={paymentMethod === method.value ? 'blue.500' : 'gray.300'}
                                        bg={paymentMethod === method.value ? 'blue.500' : 'white'}
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {paymentMethod === method.value && (
                                            <Box w={2} h={2} borderRadius="full" bg="white" />
                                        )}
                                    </Box>
                                    <Text fontWeight="semibold">{method.label}</Text>
                                </HStack>
                                <Text fontSize="xs" color="gray.500" ml={6}>{method.description}</Text>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>
            </Card.Body>
        </Card.Root>
    );
}

