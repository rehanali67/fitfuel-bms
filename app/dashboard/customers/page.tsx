"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Card,
    HStack,
    VStack,
    Text,
    Heading,
    Button,
    Input,
    SimpleGrid,
    Icon,
    Flex,
    Badge,
    Dialog,
    Portal,
    CloseButton,
    Table,
    IconButton,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuSearch,
    LuUser,
    LuEye,
    LuTrash2,
    LuPencil,
    LuHistory,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { ClientResponse } from "@/lib/models/Client";

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<ClientResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<ClientResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const timeoutId = setTimeout(() => {
                fetchCustomers();
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            fetchCustomers();
        }
    }, [searchQuery]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            params.append('limit', '100');

            const response = await apiClient.get<ClientResponse[]>(`/api/clients?${params.toString()}`);

            if (response.success && response.data) {
                const clientsArray = Array.isArray(response.data) ? response.data : [];
                setCustomers(clientsArray);
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load customers",
                description: "Please try again later",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = (customer: ClientResponse) => {
        setCustomerToDelete(customer);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!customerToDelete) return;

        setIsDeleting(true);
        try {
            const response = await apiClient.delete(`/api/clients/${customerToDelete.id}`);
            if (response.success) {
                toaster.create({
                    title: "Customer deleted",
                    description: `${customerToDelete.name} has been removed.`,
                    type: "success",
                });
                setDeleteDialogOpen(false);
                setCustomerToDelete(null);
                fetchCustomers();
            } else {
                throw new Error(response.error || "Failed to delete customer");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to delete customer",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="lg" fontWeight="semibold">Customers</Heading>
                        <Text color="gray.500" fontSize="sm">Manage your customer database</Text>
                    </Box>
                </Flex>

                {/* Filters & Search */}
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                    <Card.Body p={4}>
                        <Flex gap={4} flexWrap="wrap" align="center">
                            <HStack flex={1} minW="200px">
                                <Icon color="gray.400"><LuSearch /></Icon>
                                <Input
                                    placeholder="Search customers..."
                                    variant="flushed"
                                    size="sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </HStack>
                        </Flex>
                    </Card.Body>
                </Card.Root>

                {/* Customers Table */}
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                    <Card.Body p={0}>
                        {isLoading ? (
                            <Box p={8} textAlign="center">
                                <Text color="gray.500">Loading customers...</Text>
                            </Box>
                        ) : customers.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Icon fontSize="4xl" color="gray.300" mb={4}>
                                    <LuUser />
                                </Icon>
                                <Text color="gray.500" mb={4}>No customers found</Text>
                                <Text color="gray.400" fontSize="sm">Customers are created automatically when you create invoices or quotations</Text>
                            </Box>
                        ) : (
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="gray.50">
                                        <Table.ColumnHeader fontWeight="medium">Name</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Phone</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Email</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Address</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium" textAlign="right">Actions</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {customers.map((customer) => (
                                        <Table.Row key={customer.id} _hover={{ bg: "gray.50" }}>
                                            <Table.Cell>
                                                <Text fontWeight="medium">{customer.name}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text color="gray.600">{customer.phone || '-'}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text color="gray.600">{customer.email || '-'}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text color="gray.600" fontSize="sm">{customer.address || '-'}</Text>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <HStack gap={2} justify="flex-end">
                                                    <Link href={`/dashboard/customers/${customer.id}`}>
                                                        <IconButton variant="ghost" size="xs" aria-label="View">
                                                            <LuEye />
                                                        </IconButton>
                                                    </Link>
                                                    <Link href={`/dashboard/customers/${customer.id}/history`}>
                                                        <IconButton variant="ghost" size="xs" aria-label="History">
                                                            <LuHistory />
                                                        </IconButton>
                                                    </Link>
                                                    <IconButton
                                                        variant="ghost"
                                                        size="xs"
                                                        colorPalette="red"
                                                        aria-label="Delete"
                                                        onClick={() => handleDelete(customer)}
                                                    >
                                                        <LuTrash2 />
                                                    </IconButton>
                                                </HStack>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        )}
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Delete Customer</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>
                                    Are you sure you want to delete <Text as="span" fontWeight="semibold">{customerToDelete?.name}</Text>? This action cannot be undone.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button colorPalette="red" onClick={confirmDelete} loading={isDeleting}>
                                    Delete
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={4} right={4}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </DashboardLayout>
    );
}

