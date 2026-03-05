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
    Table,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuSearch,
    LuClipboardList,
    LuDownload,
    LuEye,
    LuTrash2,
    LuCopy,
    LuSend,
    LuFileText,
    LuCheck,
    LuX,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { PaginatedResponse } from "@/types/api";
import { QuotationResponse } from "@/lib/models/Quotation";

function getStatusColor(status: string) {
    switch (status) {
        case "Accepted": return "green";
        case "Sent": return "blue";
        case "Draft": return "gray";
        case "Expired": return "orange";
        case "Declined": return "red";
        default: return "gray";
    }
}

export default function QuotationsPage() {
    const router = useRouter();
    const [quotations, setQuotations] = useState<QuotationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<QuotationResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [convertDialogOpen, setConvertDialogOpen] = useState(false);
    const [quoteToConvert, setQuoteToConvert] = useState<QuotationResponse | null>(null);
    const [isConverting, setIsConverting] = useState(false);

    useEffect(() => {
        fetchQuotations();
    }, [selectedStatus]);

    // Refetch when search query changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== undefined) {
                fetchQuotations();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchQuotations = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (selectedStatus && selectedStatus !== 'All') params.append('status', selectedStatus);
            params.append('limit', '100');

            const response = await apiClient.get<PaginatedResponse<QuotationResponse>>(`/api/quotations?${params.toString()}`);
            if (response.success && response.data) {
                setQuotations(response.data.data || []);
            } else {
                console.error("Failed to fetch quotations:", response);
                setQuotations([]);
                if (response.error) {
                    toaster.create({
                        title: "Failed to load quotations",
                        description: response.error,
                        type: "error",
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching quotations:", error);
            setQuotations([]);
            toaster.create({
                title: "Failed to load quotations",
                description: error instanceof Error ? error.message : "Please try again later",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        fetchQuotations();
    };

    // Use quotations directly since API already handles filtering
    // Only do client-side filtering if needed for additional logic
    const filteredQuotations = quotations;

    const stats = [
        { label: "Total Quotations", value: quotations.length.toString(), color: "purple" },
        { label: "Accepted", value: quotations.filter(q => q.status === "Accepted").length.toString(), color: "green" },
        { label: "Pending", value: quotations.filter(q => q.status === "Sent").length.toString(), color: "blue" },
        { label: "Conversion Rate", value: quotations.length > 0 ? `${Math.round((quotations.filter(q => q.status === "Accepted").length / quotations.length) * 100)}%` : "0%", color: "purple" },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        toaster.create({
            title: "Exporting quotations...",
            type: "loading",
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsExporting(false);
        toaster.dismiss();
        toaster.create({
            title: "Export complete",
            description: "Your quotation data has been downloaded.",
            type: "success",
        });
    };

    const openDeleteDialog = (quote: typeof quotations[0]) => {
        setQuoteToDelete(quote);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!quoteToDelete) return;

        setIsDeleting(true);
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-quotation",
            title: "Deleting quotation...",
            type: "loading",
        });

        try {
            const response = await apiClient.delete(`/api/quotations/${quoteToDelete.id}`);
            if (response.success) {
                setQuotations(quotations.filter(q => q.id !== quoteToDelete.id));
                toaster.dismiss("deleting-quotation");
                toaster.create({
                    title: "Quotation deleted",
                    description: `${quoteToDelete.quotationNumber} has been removed.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to delete quotation");
            }
        } catch (error) {
            toaster.dismiss("deleting-quotation");
            toaster.create({
                title: "Failed to delete quotation",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
            setQuoteToDelete(null);
        }
    };

    const handleDuplicate = async (quote: QuotationResponse) => {
        toaster.create({
            id: "duplicating-quotation",
            title: "Duplicating quotation...",
            type: "loading",
        });

        try {
            const response = await apiClient.post<QuotationResponse>(`/api/quotations/${quote.id}/duplicate`);
            if (response.success && response.data) {
                setQuotations([response.data, ...quotations]);
                toaster.dismiss("duplicating-quotation");
                toaster.create({
                    title: "Quotation duplicated",
                    description: `New draft ${response.data.quotationNumber} created.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to duplicate quotation");
            }
        } catch (error) {
            toaster.dismiss("duplicating-quotation");
            toaster.create({
                title: "Failed to duplicate quotation",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        }
    };

    const handleSend = async (quote: QuotationResponse) => {
        toaster.create({
            id: "sending-quotation",
            title: "Sending quotation...",
            type: "loading",
        });

        try {
            const response = await apiClient.post(`/api/quotations/${quote.id}/send`);
            if (response.success) {
                setQuotations(quotations.map(q =>
                    q.id === quote.id ? { ...q, status: "Sent" } : q
                ));
                toaster.dismiss("sending-quotation");
                toaster.create({
                    title: "Quotation sent!",
                    description: `${quote.quotationNumber} has been sent successfully`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to send quotation");
            }
        } catch (error) {
            toaster.dismiss("sending-quotation");
            toaster.create({
                title: "Failed to send quotation",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        }
    };

    const openConvertDialog = (quote: typeof quotations[0]) => {
        setQuoteToConvert(quote);
        setConvertDialogOpen(true);
    };

    const handleConvertToInvoice = async () => {
        if (!quoteToConvert) return;

        setIsConverting(true);
        setConvertDialogOpen(false);
        toaster.create({
            id: "converting-quotation",
            title: "Converting to invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.post(`/api/quotations/${quoteToConvert.id}/convert`);
            if (response.success) {
                toaster.dismiss("converting-quotation");
                toaster.create({
                    title: "Invoice created!",
                    description: `New invoice created from ${quoteToConvert.quotationNumber}`,
                    type: "success",
                });
                router.push("/dashboard/invoices");
            } else {
                throw new Error(response.error || "Failed to convert quotation");
            }
        } catch (error) {
            toaster.dismiss("converting-quotation");
            toaster.create({
                title: "Failed to convert quotation",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsConverting(false);
            setQuoteToConvert(null);
        }
    };

    const handleMarkAccepted = async (quote: QuotationResponse) => {
        toaster.create({
            id: "updating-status",
            title: "Updating status...",
            type: "loading",
        });

        try {
            const response = await apiClient.patch(`/api/quotations/${quote.id}/status`, {
                status: "Accepted",
            });
            if (response.success) {
                setQuotations(quotations.map(q =>
                    q.id === quote.id ? { ...q, status: "Accepted" } : q
                ));
                toaster.dismiss("updating-status");
                toaster.create({
                    title: "Status updated",
                    description: `${quote.quotationNumber} marked as accepted.`,
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

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size={{ base: "lg", md: "xl" }} fontWeight="semibold">Quotations</Heading>
                        <Text color="fg.muted" fontSize="sm">
                            Create and manage quotes for your clients
                        </Text>
                    </Box>
                    <HStack gap={2} flexWrap="wrap">

                        <Link href="/dashboard/quotations/create">
                            <Button colorPalette="purple" size="sm">
                                <LuPlus /> <Text display={{ base: "none", sm: "inline" }}>New Quotation</Text>
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
                                    placeholder="Search quotations..."
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
                                {["All", "Sent", "Accepted", "Draft", "Expired", "Declined"].map((status) => (
                                    <Button
                                        key={status}
                                        size="xs"
                                        variant={selectedStatus === (status === "All" ? null : status) || (status === "All" && !selectedStatus) ? "solid" : "outline"}
                                        colorPalette={status === "All" ? "gray" : getStatusColor(status)}
                                        onClick={() => setSelectedStatus(status === "All" ? null : status)}
                                        transition="all 0.15s"
                                    >
                                        {status}
                                    </Button>
                                ))}
                            </HStack>
                        </Flex>
                    </Card.Body>
                </Card.Root>

                {/* Quotations Table */}
                <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default" overflow="hidden">
                    <Box overflowX="auto">
                        <Table.Root size="sm" minW="900px">
                            <Table.Header>
                                <Table.Row bg="bg.subtle">
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Quote #</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Client</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Amount</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Status</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Date</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted">Valid Until</Table.ColumnHeader>
                                    <Table.ColumnHeader fontWeight="semibold" fontSize="xs" color="fg.muted" textAlign="right">Actions</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {isLoading ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={8} textAlign="center" py={8}>
                                            <Text color="fg.muted">Loading quotations...</Text>
                                        </Table.Cell>
                                    </Table.Row>
                                ) : filteredQuotations.length === 0 ? (
                                    <Table.Row>
                                        <Table.Cell colSpan={8} textAlign="center" py={8}>
                                            <VStack gap={2}>
                                                <Text color="fg.muted">No quotations found</Text>
                                                {quotations.length > 0 && (
                                                    <Text fontSize="xs" color="fg.subtle">
                                                        {searchQuery || selectedStatus ? "Try adjusting your search or filters" : ""}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Table.Cell>
                                    </Table.Row>
                                ) : (
                                    filteredQuotations.map((quote) => (
                                        <Table.Row
                                            key={quote.id}
                                            _hover={{ bg: "bg.subtle" }}
                                            transition="background 0.15s"
                                        >
                                            <Table.Cell>
                                                <HStack gap={3}>
                                                    <Flex
                                                        w={8}
                                                        h={8}
                                                        borderRadius="lg"
                                                        bg="purple.500/10"
                                                        align="center"
                                                        justify="center"
                                                    >
                                                        <Icon color="purple.500" fontSize="sm"><LuClipboardList /></Icon>
                                                    </Flex>
                                                    <Text fontWeight="medium" fontSize="sm">{quote.quotationNumber}</Text>
                                                </HStack>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="medium" fontSize="sm">{quote.client}</Text>
                                                    {quote.clientPhone && (
                                                        <Text fontSize="xs" color="fg.muted">{quote.clientPhone}</Text>
                                                    )}
                                                </VStack>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontWeight="semibold" fontSize="sm">QAR {quote.total.toLocaleString()}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge
                                                    size="sm"
                                                    colorPalette={getStatusColor(quote.status)}
                                                    variant="subtle"
                                                >
                                                    {quote.status}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm" color="fg.muted">
                                                    {new Date(quote.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm" color="fg.muted">
                                                    {new Date(quote.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <HStack gap={1} justify="flex-end">
                                                    <Link href={`/dashboard/quotations/${quote.id}`}>
                                                        <Button variant="ghost" size="xs" _hover={{ bg: "purple.500/10", color: "purple.600" }}>
                                                            <LuEye />
                                                        </Button>
                                                    </Link>
                                                    {quote.status === "Sent" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={() => handleMarkAccepted(quote)}
                                                            _hover={{ bg: "green.500/10", color: "green.600" }}
                                                        >
                                                            <LuCheck />
                                                        </Button>
                                                    )}
                                                    {quote.status === "Accepted" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={() => openConvertDialog(quote)}
                                                            _hover={{ bg: "blue.500/10", color: "blue.600" }}
                                                        >
                                                            <LuFileText />
                                                        </Button>
                                                    )}
                                                    {quote.status === "Draft" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={() => handleSend(quote)}
                                                            _hover={{ bg: "blue.500/10", color: "blue.600" }}
                                                        >
                                                            <LuSend />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => handleDuplicate(quote)}
                                                        _hover={{ bg: "bg.muted" }}
                                                    >
                                                        <LuCopy />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        colorPalette="red"
                                                        onClick={() => openDeleteDialog(quote)}
                                                        _hover={{ bg: "red.500/10" }}
                                                    >
                                                        <LuTrash2 />
                                                    </Button>
                                                </HStack>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))
                                )}
                            </Table.Body>
                        </Table.Root>
                    </Box>
                </Card.Root>

                {/* Empty State - Only show when not loading and no quotations */}
                {!isLoading && filteredQuotations.length === 0 && quotations.length === 0 && (
                    <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                        <Card.Body p={10}>
                            <VStack gap={4}>
                                <Flex
                                    w={16}
                                    h={16}
                                    borderRadius="full"
                                    bg="bg.muted"
                                    align="center"
                                    justify="center"
                                >
                                    <Icon fontSize="2xl" color="fg.subtle"><LuClipboardList /></Icon>
                                </Flex>
                                <VStack gap={1}>
                                    <Text fontWeight="medium">No quotations found</Text>
                                    <Text fontSize="sm" color="fg.muted">
                                        {searchQuery || selectedStatus ? "Try adjusting your search or filters" : "Create your first quotation to get started"}
                                    </Text>
                                </VStack>
                                <Link href="/dashboard/quotations/create">
                                    <Button colorPalette="purple" size="sm">
                                        <LuPlus /> Create Quotation
                                    </Button>
                                </Link>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
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
                                <Dialog.Title fontWeight="semibold">Delete Quotation</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body px={6} pb={6}>
                                <Text color="fg.muted">
                                    Are you sure you want to delete <Text as="span" fontWeight="semibold">{quoteToDelete?.quotationNumber}</Text> for {quoteToDelete?.client}?
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

            {/* Convert to Invoice Dialog */}
            <Dialog.Root
                open={convertDialogOpen}
                onOpenChange={(e) => setConvertDialogOpen(e.open)}
            >
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="bg.surface" borderRadius="xl" mx={4}>
                            <Dialog.Header p={6} pb={4}>
                                <Dialog.Title fontWeight="semibold">Convert to Invoice</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body px={6} pb={6}>
                                <VStack align="stretch" gap={4}>
                                    <Text color="fg.muted">
                                        Create an invoice from quotation <Text as="span" fontWeight="semibold">{quoteToConvert?.quotationNumber}</Text>?
                                    </Text>
                                    <Box bg="purple.500/10" p={4} borderRadius="lg">
                                        <HStack justify="space-between" mb={2}>
                                            <Text fontSize="sm" color="fg.muted">Client</Text>
                                            <Text fontSize="sm" fontWeight="medium">{quoteToConvert?.client}</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="fg.muted">Amount</Text>
                                            <Text fontSize="sm" fontWeight="semibold" color="purple.600">QAR {quoteToConvert?.total.toLocaleString()}</Text>
                                        </HStack>
                                    </Box>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer p={6} pt={4} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" disabled={isConverting}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="blue"
                                    onClick={handleConvertToInvoice}
                                    loading={isConverting}
                                    loadingText="Creating..."
                                >
                                    <LuFileText /> Create Invoice
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
