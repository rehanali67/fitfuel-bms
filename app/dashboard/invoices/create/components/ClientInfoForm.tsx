"use client";

import {
    Card,
    Heading,
    SimpleGrid,
    Field,
    Input,
    Box,
    HStack,
    VStack,
    Text,
    List,
    Icon,
} from "@chakra-ui/react";
import { LuUser } from "react-icons/lu";
import { ClientResponse } from "@/lib/models/Client";

interface ClientInfoFormProps {
    clientName: string;
    clientPhone: string;
    onClientNameChange: (value: string) => void;
    onClientPhoneChange: (value: string) => void;
    clients: ClientResponse[];
    showClientDropdown: boolean;
    isSearchingClients: boolean;
    onClientSelect: (client: ClientResponse) => void;
    onClientNameFocus: () => void;
    onClientNameBlur: () => void;
}

export default function ClientInfoForm({
    clientName,
    clientPhone,
    onClientNameChange,
    onClientPhoneChange,
    clients,
    showClientDropdown,
    isSearchingClients,
    onClientSelect,
    onClientNameFocus,
    onClientNameBlur,
}: ClientInfoFormProps) {
    return (
        <Card.Root border="1px solid" borderColor="gray.100" bg="white">
            <Card.Header p={5} pb={0}>
                <Heading size="sm" fontWeight="semibold">Client Information</Heading>
            </Card.Header>
            <Card.Body p={5}>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field.Root flex={1}>
                        <Field.Label fontSize="sm">Client Name</Field.Label>
                        <Box position="relative" w="100%">
                            <Input
                                placeholder="Search or enter client name"
                                size="sm"
                                w="100%"
                                value={clientName}
                                onChange={(e) => onClientNameChange(e.target.value)}
                                onFocus={onClientNameFocus}
                                onBlur={onClientNameBlur}
                            />
                            {showClientDropdown && clients.length > 0 && (
                                <Box
                                    position="absolute"
                                    top="100%"
                                    left={0}
                                    right={0}
                                    zIndex={1000}
                                    bg="white"
                                    borderWidth="1px"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    shadow="lg"
                                    mt={1}
                                    maxH="200px"
                                    overflowY="auto"
                                >
                                    <List.Root>
                                        {clients.map((client) => (
                                            <List.Item
                                                key={client.id}
                                                cursor="pointer"
                                                _hover={{ bg: "blue.50" }}
                                                onClick={() => onClientSelect(client)}
                                                p={2}
                                                borderBottomWidth="1px"
                                                borderColor="gray.100"
                                            >
                                                <HStack gap={2}>
                                                    <Icon color="blue.500"><LuUser /></Icon>
                                                    <VStack align="start" gap={0} flex={1}>
                                                        <Text fontSize="sm" fontWeight="medium">{client.name}</Text>
                                                        <Text fontSize="xs" color="gray.500">{client.phone}</Text>
                                                    </VStack>
                                                </HStack>
                                            </List.Item>
                                        ))}
                                    </List.Root>
                                </Box>
                            )}
                        </Box>
                    </Field.Root>
                    <Field.Root flex={1}>
                        <Field.Label fontSize="sm">Phone</Field.Label>
                        <Input
                            placeholder="+1 (555) 000-0000"
                            size="sm"
                            w="100%"
                            value={clientPhone}
                            onChange={(e) => onClientPhoneChange(e.target.value)}
                        />
                    </Field.Root>
                </SimpleGrid>
            </Card.Body>
        </Card.Root>
    );
}

