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
} from "@chakra-ui/react";
import {
    LuPlus,
    LuSearch,
    LuFileText,
    LuDownload,
    LuEye,
    LuSend,
    LuTrash2,
    LuPencil,
    LuCheck,
    LuCopy,
    LuChevronLeft,
    LuChevronRight,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { PaginatedResponse } from "@/types/api";
import { InvoiceResponse } from "@/lib/models/Invoice";

function getStatusColor(status: string) {
    switch (status) {
        case "Paid": return "green";
        case "Pending": return "yellow";
        case "Overdue": return "red";
        case "Draft": return "gray";
        default: return "gray";
    }
}

export default function InvoicesPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<InvoiceResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [invoiceToSend, setInvoiceToSend] = useState<InvoiceResponse | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setCurrentPage(1); // Reset to page 1 when filters change
        fetchInvoices(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPaymentMethod]);

    useEffect(() => {
        fetchInvoices(currentPage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const fetchInvoices = async (page: number = 1) => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedPaymentMethod && selectedPaymentMethod !== 'All') {
                // Note: API doesn't support paymentMethod filter yet, so we'll filter client-side for now
            }
            params.append('page', page.toString());
            params.append('limit', '20');

            const response = await apiClient.get<PaginatedResponse<InvoiceResponse>>(`/api/invoices?${params.toString()}`);
            if (response.success && response.data) {
                setInvoices(response.data.data);
                setTotalPages(response.data.pagination.totalPages);
                setTotal(response.data.pagination.total);
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load invoices",
                description: "Please try again later",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchInvoices(1);
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const matchesPaymentMethod = !selectedPaymentMethod || selectedPaymentMethod === 'All' || invoice.paymentMethod === selectedPaymentMethod;
        return matchesPaymentMethod;
    });

    const stats = [
        { label: "Total Invoices", value: total.toString(), color: "blue" },
        { label: "Paid", value: `QAR ${invoices.filter(i => i.status === "Paid").reduce((acc, i) => acc + i.total, 0).toLocaleString()}`, color: "green" },
        { label: "Pending", value: `QAR ${invoices.filter(i => i.status === "Pending").reduce((acc, i) => acc + i.total, 0).toLocaleString()}`, color: "yellow" },
        { label: "Overdue", value: `QAR ${invoices.filter(i => i.status === "Overdue").reduce((acc, i) => acc + i.total, 0).toLocaleString()}`, color: "red" },
    ];

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };



    const openDeleteDialog = (invoice: typeof invoices[0]) => {
        setInvoiceToDelete(invoice);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!invoiceToDelete) return;

        setIsDeleting(true);
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-invoice",
            title: "Deleting invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.delete(`/api/invoices/${invoiceToDelete.id}`);
            if (response.success) {
                toaster.dismiss("deleting-invoice");
                toaster.create({
                    title: "Invoice deleted",
                    description: `${invoiceToDelete.invoiceNumber} has been removed.`,
                    type: "success",
                });
                // Refresh invoices - if current page becomes empty, go to previous page
                const updatedInvoices = invoices.filter(i => i.id !== invoiceToDelete.id);
                if (updatedInvoices.length === 0 && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchInvoices(currentPage);
                }
            } else {
                throw new Error(response.error || "Failed to delete invoice");
            }
        } catch (error) {
            toaster.dismiss("deleting-invoice");
            toaster.create({
                title: "Failed to delete invoice",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
            setInvoiceToDelete(null);
        }
    };

    const openSendDialog = (invoice: typeof invoices[0]) => {
        setInvoiceToSend(invoice);
        setSendDialogOpen(true);
    };

    const handleSend = async () => {
        if (!invoiceToSend) return;

        setIsSending(true);
        setSendDialogOpen(false);
        toaster.create({
            id: "sending-invoice",
            title: "Sending invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.post(`/api/invoices/${invoiceToSend.id}/send`);
            if (response.success) {
                setInvoices(invoices.map(i =>
                    i.id === invoiceToSend.id ? { ...i, status: "Pending" } : i
                ));
                toaster.dismiss("sending-invoice");
                toaster.create({
                    title: "Invoice sent!",
                    description: `Invoice has been sent successfully.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to send invoice");
            }
        } catch (error) {
            toaster.dismiss("sending-invoice");
            toaster.create({
                title: "Failed to send invoice",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsSending(false);
            setInvoiceToSend(null);
        }
    };

    const handleMarkAsPaid = async (invoice: InvoiceResponse) => {
        toaster.create({
            id: "updating-status",
            title: "Updating status...",
            type: "loading",
        });

        try {
            const response = await apiClient.patch(`/api/invoices/${invoice.id}/status`, {
                status: "Paid",
            });
            if (response.success) {
                setInvoices(invoices.map(i =>
                    i.id === invoice.id ? { ...i, status: "Paid" } : i
                ));
                toaster.dismiss("updating-status");
                toaster.create({
                    title: "Status updated",
                    description: `${invoice.invoiceNumber} marked as paid.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to update status");
            }
        } catch (error) {
            toaster.dismiss("updating-status");
            toaster.create({
                title: "Failed to update status",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        }
    };

    const handleDuplicate = async (invoice: InvoiceResponse) => {
        toaster.create({
            id: "duplicating-invoice",
            title: "Duplicating invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.post<InvoiceResponse>(`/api/invoices/${invoice.id}/duplicate`);
            if (response.success && response.data) {
                setInvoices([response.data, ...invoices]);
                toaster.dismiss("duplicating-invoice");
                toaster.create({
                    title: "Invoice duplicated",
                    description: `New draft ${response.data.invoiceNumber} created.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to duplicate invoice");
            }
        } catch (error) {
            toaster.dismiss("duplicating-invoice");
            toaster.create({
                title: "Failed to duplicate invoice",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        }
    };

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size={{ base: "lg", md: "xl" }} fontWeight="semibold">Invoices</Heading>
                        <Text color="fg.muted" fontSize="sm">
                            Manage and track all your invoices
                        </Text>
                    </Box>
                    <HStack gap={2} flexWrap="wrap">

                        <Link href="/dashboard/invoices/create">
                            <Button colorPalette="blue" size="sm">
                                <LuPlus /> <Text display={{ base: "none", sm: "inline" }}>New Invoice</Text>
                            </Button>
                        </Link>
                    </HStack>
                </Flex>

                {/* Stats */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    {stats.map((stat) => (
                        <Card.Root
                            key={stat.label}
                            bg="bg.surface"
                            borderWidth="1px"
                            borderColor="border.default"
                            transition="all 0.2s"
                            _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                            cursor="pointer"
                        >
                            <Card.Body p={4}>
                                <VStack align="start" gap={1}>
                                    <Text color="fg.muted" fontSize="xs" fontWeight="medium">
                                        {stat.label}
                                    </Text>
                                    <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="semibold" color={`${stat.color}.600`}>
                                        {stat.value}
                                    </Text>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>

                {/* Filters & Search */}
                <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                    <Card.Body p={4}>
                        <Flex gap={3} flexWrap="wrap" align="center">
                            <HStack flex={1} minW="200px">
                                <Icon color="fg.subtle"><LuSearch /></Icon>
                                <Input
                                    placeholder="Search invoices..."
                                    variant="flushed"
                                    size="sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                />
                            </HStack>
                            <HStack gap={2} flexWrap="wrap">
                                <Text fontSize="xs" color="fg.muted" fontWeight="medium" mr={1}>Payment:</Text>
                                {["All", "cash", "card", "bank-transfer", "Fawran", "Pending"].map((method) => (
                                    <Button
                                        key={method}
                                        size="xs"
                                        variant={selectedPaymentMethod === (method === "All" ? null : method) || (method === "All" && !selectedPaymentMethod) ? "solid" : "outline"}
                                        colorPalette="blue"
                                        onClick={() => setSelectedPaymentMethod(method === "All" ? null : method)}
                                        transition="all 0.15s"
                                    >
                                        {method === "bank-transfer" ? "Bank Transfer" : method}
                                    </Button>
                                ))}
                            </HStack>
                        </Flex>
                    </Card.Body>
                </Card.Root>

                {/* Invoices List */}
                <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                    <Card.Body p={4}>
                        {isLoading ? (
                            <VStack py={8}>
                                <Text color="fg.muted">Loading invoices...</Text>
                            </VStack>
                        ) : filteredInvoices.length === 0 ? (
                            <VStack py={8} gap={4}>
                                <Flex
                                    w={16}
                                    h={16}
                                    borderRadius="full"
                                    bg="bg.muted"
                                    align="center"
                                    justify="center"
                                >
                                    <Icon fontSize="2xl" color="fg.subtle"><LuFileText /></Icon>
                                </Flex>
                                <VStack gap={1}>
                                    <Text fontWeight="medium">No invoices found</Text>
                                    <Text fontSize="sm" color="fg.muted">Try adjusting your search or filters</Text>
                                </VStack>
                                <Link href="/dashboard/invoices/create">
                                    <Button colorPalette="blue" size="sm">
                                        <LuPlus /> Create Invoice
                                    </Button>
                                </Link>
                            </VStack>
                        ) : (
                            <VStack gap={3} align="stretch">
                                {filteredInvoices.map((invoice) => (
                                    <Card.Root
                                        key={invoice.id}
                                        borderWidth="1px"
                                        borderColor="border.default"
                                        bg="bg.subtle"
                                        _hover={{ bg: "bg.muted", borderColor: "gray.300", shadow: "sm" }}
                                        transition="all 0.15s"
                                        cursor="pointer"
                                        onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}
                                    >
                                        <Card.Body p={4}>
                                            <Flex justify="space-between" align="start" gap={4}>
                                                <HStack gap={4} flex={1}>
                                                    <Flex
                                                        w={10}
                                                        h={10}
                                                        borderRadius="lg"
                                                        bg="blue.500/10"
                                                        align="center"
                                                        justify="center"
                                                    >
                                                        <Icon color="blue.500" fontSize="md"><LuFileText /></Icon>
                                                    </Flex>
                                                    <VStack align="start" gap={1} flex={1}>
                                                        <HStack gap={2} align="center">
                                                            <Text fontWeight="semibold" fontSize="sm">{invoice.invoiceNumber}</Text>
                                                            {invoice.paymentMethod && (
                                                                <Badge
                                                                    size="sm"
                                                                    colorPalette="orange"
                                                                    variant="solid"
                                                                    borderRadius="full"
                                                                    px={3}
                                                                    py={0.5}
                                                                    fontWeight="medium"
                                                                    boxShadow="sm"
                                                                >
                                                                    {invoice.paymentMethod === 'bank-transfer' ? 'Bank Transfer' : invoice.paymentMethod.charAt(0).toUpperCase() + invoice.paymentMethod.slice(1)}
                                                                </Badge>
                                                            )}
                                                        </HStack>
                                                        <Text fontSize="sm" color="fg.muted" fontWeight="medium">{invoice.client}</Text>
                                                        {invoice.clientPhone && (
                                                            <Text fontSize="xs" color="fg.muted">{invoice.clientPhone}</Text>
                                                        )}
                                                        <HStack gap={4} mt={1}>
                                                            <Text fontSize="xs" color="fg.muted">
                                                                Issue: {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </Text>
                                                            <Text fontSize="xs" color="fg.muted">
                                                            </Text>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <VStack align="end" gap={2}>
                                                    <Text fontWeight="bold" fontSize="lg" color="blue.600">
                                                        QAR {invoice.total.toLocaleString()}
                                                    </Text>
                                                    <HStack gap={1}>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            _hover={{ bg: "blue.500/10", color: "blue.600" }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/dashboard/invoices/${invoice.id}`);
                                                            }}
                                                        >
                                                            <LuEye />
                                                        </Button>
                                                        {(invoice.status === "Pending" || invoice.status === "Overdue") && (
                                                            <Button
                                                                variant="ghost"
                                                                size="xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsPaid(invoice);
                                                                }}
                                                                _hover={{ bg: "green.500/10", color: "green.600" }}
                                                            >
                                                                <LuCheck />
                                                            </Button>
                                                        )}
                                                        {invoice.status === "Draft" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="xs"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openSendDialog(invoice);
                                                                }}
                                                                _hover={{ bg: "blue.500/10", color: "blue.600" }}
                                                            >
                                                                <LuSend />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDuplicate(invoice);
                                                            }}
                                                            _hover={{ bg: "bg.muted" }}
                                                        >
                                                            <LuCopy />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            colorPalette="red"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteDialog(invoice);
                                                            }}
                                                            _hover={{ bg: "red.500/10" }}
                                                        >
                                                            <LuTrash2 />
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </Flex>
                                        </Card.Body>
                                    </Card.Root>
                                ))}
                            </VStack>
                        )}
                    </Card.Body>
                </Card.Root>

                {/* Pagination Controls - Bottom Right */}
                {totalPages > 1 && (
                    <Flex justify="flex-end" mt={6}>
                        <HStack gap={2} align="center">
                            <Text fontSize="sm" color="fg.muted">
                                Page {currentPage} of {totalPages}
                            </Text>
                            <HStack gap={1}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || isLoading}
                                >
                                    <LuChevronLeft />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || isLoading}
                                >
                                    <LuChevronRight />
                                </Button>
                            </HStack>
                        </HStack>
                    </Flex>
                )}

            </VStack>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root
                open={deleteDialogOpen}
                onOpenChange={(e) => setDeleteDialogOpen(e.open)}
                role="alertdialog"
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="bg.surface" borderRadius="xl" mx={4}>
                            <Dialog.Header p={6} pb={4}>
                                <Dialog.Title fontWeight="semibold">Delete Invoice</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body px={6} pb={6}>
                                <Text color="fg.muted">
                                    Are you sure you want to delete <Text as="span" fontWeight="semibold">{invoiceToDelete?.invoiceNumber}</Text> for {invoiceToDelete?.client}?
                                    This action cannot be undone.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={6} pt={4} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" disabled={isDeleting}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="red"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                    loadingText="Deleting..."
                                >
                                    <LuTrash2 /> Delete
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={4} right={4}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Send Invoice Dialog */}
            <Dialog.Root
                open={sendDialogOpen}
                onOpenChange={(e) => setSendDialogOpen(e.open)}
            >
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
                                        Send <Text as="span" fontWeight="semibold">{invoiceToSend?.invoiceNumber}</Text> (QAR {invoiceToSend?.total.toLocaleString()}) to:
                                    </Text>
                                    <Box bg="bg.subtle" p={4} borderRadius="lg">
                                        <Text fontWeight="medium">{invoiceToSend?.client}</Text>
                                        {invoiceToSend?.clientPhone && (
                                            <Text fontSize="sm" color="fg.muted">{invoiceToSend?.clientPhone}</Text>
                                        )}
                                    </Box>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer p={6} pt={4} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" disabled={isSending}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="blue"
                                    onClick={handleSend}
                                    loading={isSending}
                                    loadingText="Sending..."
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
        </DashboardLayout>
    );
}
