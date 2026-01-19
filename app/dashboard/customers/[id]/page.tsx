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
    Icon,
    Flex,
    Badge,
    Dialog,
    Portal,
    CloseButton,
    IconButton,
    Field,
    Input,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuTrash2,
    LuPencil,
    LuHistory,
    LuSave,
    LuX,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { ClientResponse } from "@/lib/models/Client";

export default function CustomerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<ClientResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        fetchCustomer();
    }, [customerId]);

    const fetchCustomer = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<ClientResponse>(`/api/clients/${customerId}`);
            if (response.success && response.data) {
                setCustomer(response.data);
                setName(response.data.name);
                setPhone(response.data.phone || "");
                setEmail(response.data.email || "");
                setAddress(response.data.address || "");
            } else {
                throw new Error(response.error || "Failed to load customer");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load customer",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
            router.push("/dashboard/customers");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await apiClient.put<ClientResponse>(`/api/clients/${customerId}`, {
                name,
                phone: phone || undefined,
                email: email || undefined,
                address: address || undefined,
            });

            if (response.success && response.data) {
                setCustomer(response.data);
                setIsEditing(false);
                toaster.create({
                    title: "Customer updated",
                    description: "Customer information has been saved successfully",
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to update customer");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to update customer",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await apiClient.delete(`/api/clients/${customerId}`);
            if (response.success) {
                toaster.create({
                    title: "Customer deleted",
                    description: "Customer has been removed successfully",
                    type: "success",
                });
                router.push("/dashboard/customers");
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
            setDeleteDialogOpen(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch">
                    <Text>Loading customer...</Text>
                </VStack>
            </DashboardLayout>
        );
    }

    if (!customer) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch">
                    <Text color="red.500">Customer not found</Text>
                    <Link href="/dashboard/customers">
                        <Button variant="outline">Back to Customers</Button>
                    </Link>
                </VStack>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <HStack gap={4}>
                        <Link href="/dashboard/customers">
                            <IconButton variant="ghost" size="sm" aria-label="Back">
                                <LuArrowLeft />
                            </IconButton>
                        </Link>
                        <Box>
                            <Heading size="lg" fontWeight="semibold">{customer.name}</Heading>
                            <Text color="gray.500" fontSize="sm">Customer Details</Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Link href={`/dashboard/customers/${customerId}/history`}>
                            <Button variant="outline" size="sm">
                                <LuHistory /> View History
                            </Button>
                        </Link>
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                    <LuX /> Cancel
                                </Button>
                                <Button colorPalette="blue" size="sm" onClick={handleSave} loading={isSaving}>
                                    <LuSave /> Save
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <LuPencil /> Edit
                                </Button>
                                <Button colorPalette="red" size="sm" onClick={handleDelete}>
                                    <LuTrash2 /> Delete
                                </Button>
                            </>
                        )}
                    </HStack>
                </Flex>

                {/* Customer Information */}
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                    <Card.Header p={5} pb={0}>
                        <Heading size="sm" fontWeight="semibold">Customer Information</Heading>
                    </Card.Header>
                    <Card.Body p={5}>
                        <VStack gap={4} align="stretch">
                            <Field.Root>
                                <Field.Label fontSize="sm">Name</Field.Label>
                                {isEditing ? (
                                    <Input
                                        size="sm"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                ) : (
                                    <Text fontWeight="medium">{customer.name}</Text>
                                )}
                            </Field.Root>
                            <Field.Root>
                                <Field.Label fontSize="sm">Phone</Field.Label>
                                {isEditing ? (
                                    <Input
                                        size="sm"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Optional"
                                    />
                                ) : (
                                    <Text color="gray.600">{customer.phone || '-'}</Text>
                                )}
                            </Field.Root>
                            <Field.Root>
                                <Field.Label fontSize="sm">Email</Field.Label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        size="sm"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Optional"
                                    />
                                ) : (
                                    <Text color="gray.600">{customer.email || '-'}</Text>
                                )}
                            </Field.Root>
                            <Field.Root>
                                <Field.Label fontSize="sm">Address</Field.Label>
                                {isEditing ? (
                                    <Input
                                        size="sm"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Optional"
                                    />
                                ) : (
                                    <Text color="gray.600">{customer.address || '-'}</Text>
                                )}
                            </Field.Root>
                        </VStack>
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
                                    Are you sure you want to delete <Text as="span" fontWeight="semibold">{customer.name}</Text>? This action cannot be undone.
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

