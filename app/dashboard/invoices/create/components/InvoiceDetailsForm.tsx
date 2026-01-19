"use client";

import { Card, Heading, SimpleGrid, Field, Input, HStack } from "@chakra-ui/react";

interface InvoiceDetailsFormProps {
    issueDate: string;
    onIssueDateChange: (value: string) => void;
}

export default function InvoiceDetailsForm({
    issueDate,
    onIssueDateChange,
}: InvoiceDetailsFormProps) {
    return (
        <Card.Root border="1px solid" borderColor="gray.100" bg="white">
            <Card.Header p={5} pb={0}>
                <Heading size="sm" fontWeight="semibold">Invoice Details</Heading>
            </Card.Header>
            <Card.Body p={5}>
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Field.Root>
                        <Field.Label fontSize="sm">Invoice Number</Field.Label>
                        <Input value="Auto-generated" readOnly size="sm" bg="gray.50" />
                    </Field.Root>
                    <Field.Root>
                        <Field.Label fontSize="sm">Issue Date</Field.Label>
                        <HStack gap={2}>
                            <Input
                                type="date"
                                size="sm"
                                flex={1}
                                value={issueDate}
                                onChange={(e) => onIssueDateChange(e.target.value)}
                            />
                        </HStack>
                    </Field.Root>
                </SimpleGrid>
            </Card.Body>
        </Card.Root>
    );
}

