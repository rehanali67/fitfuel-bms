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
    Badge,
    SimpleGrid,
    IconButton,
    Flex,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuPencil,
    LuSend,
    LuPrinter,
    LuCopy,
    LuTrash2,
} from "react-icons/lu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { InvoiceResponse } from "@/lib/models/Invoice";

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "paid": return "green";
        case "pending": return "yellow";
        case "overdue": return "red";
        case "draft": return "gray";
        default: return "gray";
    }
};

export default function InvoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const invoiceId = params.id as string;
    const { user: currentUser } = useAuth();

    // Data state
    const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productsMap, setProductsMap] = useState<Map<string, { arabicName?: string }>>(new Map());
    const [companyInfo, setCompanyInfo] = useState({
        name: "Your Company Name",
        email: "invoices@yourcompany.com",
        address: "456 Enterprise Ave, Floor 5, San Francisco, CA 94102",
        phone: "+1 (555) 987-6543",
        bankName: "",
        bankAccount: "",
        bankIBAN: "",
        bankBranch: "",
    });

    // UI state
    const [isSending, setIsSending] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'Fawran' | 'Pending' | undefined>(undefined);

    useEffect(() => {
        if (invoiceId) {
            fetchInvoice();
        }
        fetchCompanyInfo();
    }, [invoiceId]);

    const fetchCompanyInfo = async () => {
        try {
            const response = await apiClient.get<{
                name: string;
                email: string;
                phone: string;
                address: string;
                city: string;
                zipCode?: string;
                bankName?: string;
                bankAccount?: string;
                bankIBAN?: string;
                bankBranch?: string;
            }>("/api/settings/company");
            if (response.success && response.data) {
                const addressParts = [response.data.address, response.data.city];
                if (response.data.zipCode) {
                    addressParts.push(response.data.zipCode);
                }
                const fullAddress = addressParts.filter(Boolean).join(", ");
                setCompanyInfo({
                    name: response.data.name,
                    email: response.data.email,
                    phone: response.data.phone,
                    address: fullAddress,
                    bankName: response.data.bankName || "",
                    bankAccount: response.data.bankAccount || "",
                    bankIBAN: response.data.bankIBAN || "",
                    bankBranch: response.data.bankBranch || "",
                });
            }
        } catch (error) {
            console.error("Failed to fetch company info:", error);
        }
    };

    const fetchInvoice = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<InvoiceResponse>(`/api/invoices/${invoiceId}`);
            if (response.success && response.data) {
                setInvoice(response.data);
                setPaymentMethod(response.data.paymentMethod);

                const productIds = response.data.items
                    .map(item => item.productId)
                    .filter((id): id is string => !!id);

                if (productIds.length > 0) {
                    const productsMap = new Map<string, { arabicName?: string }>();
                    await Promise.all(
                        productIds.map(async (productId) => {
                            try {
                                const productResponse = await apiClient.get<{ arabicName?: string }>(`/api/inventory/${productId}`);
                                if (productResponse.success && productResponse.data) {
                                    productsMap.set(productId, { arabicName: productResponse.data.arabicName });
                                }
                            } catch (error) {
                                console.error(`Failed to fetch product ${productId}:`, error);
                            }
                        })
                    );
                    setProductsMap(productsMap);
                }
            } else {
                throw new Error(response.error || "Failed to load invoice");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load invoice");
            toaster.create({
                title: "Error",
                description: err.message || "Failed to load invoice",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };



    const handleDuplicate = async () => {
        if (!invoice) return;

        toaster.create({
            id: "duplicating",
            title: "Creating duplicate...",
            type: "loading",
        });

        try {
            const response = await apiClient.post<InvoiceResponse>(`/api/invoices/${invoiceId}/duplicate`);
            const newInvoice = response.data;
            if (response.success && newInvoice) {
                toaster.dismiss("duplicating");
                toaster.create({
                    title: "Invoice duplicated",
                    description: `Redirecting to new invoice...`,
                    type: "success",
                });
                setTimeout(() => router.push(`/dashboard/invoices/${newInvoice.id}`), 500);
            } else {
                throw new Error(response.error || "Failed to duplicate invoice");
            }
        } catch (err: any) {
            toaster.dismiss("duplicating");
            toaster.create({
                title: "Failed to duplicate invoice",
                description: err.message || "Please try again",
                type: "error",
            });
        }
    };

    const handleSend = async () => {
        if (!invoice) return;

        setIsSending(true);
        setSendDialogOpen(false);
        toaster.create({
            id: "sending",
            title: "Sending invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.post(`/api/invoices/${invoiceId}/send`);
            if (response.success) {
                await fetchInvoice();
                toaster.dismiss("sending");
                toaster.create({
                    title: "Invoice sent!",
                    description: `Invoice has been sent successfully.`,
                    type: "success",
                });
            } else {
                throw new Error(response.error || "Failed to send invoice");
            }
        } catch (err: any) {
            toaster.dismiss("sending");
            toaster.create({
                title: "Failed to send invoice",
                description: err.message || "Please try again",
                type: "error",
            });
        } finally {
            setIsSending(false);
        }
    };


    const handleDelete = async () => {
        if (!invoice) return;

        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting",
            title: "Deleting invoice...",
            type: "loading",
        });

        try {
            const response = await apiClient.delete(`/api/invoices/${invoiceId}`);
            if (response.success) {
                toaster.dismiss("deleting");
                toaster.create({
                    title: "Invoice deleted",
                    type: "success",
                });
                router.push("/dashboard/invoices");
            } else {
                throw new Error(response.error || "Failed to delete invoice");
            }
        } catch (err: any) {
            toaster.dismiss("deleting");
            toaster.create({
                title: "Failed to delete invoice",
                description: err.message || "Please try again",
                type: "error",
            });
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch" py={8}>
                    <Text>Loading invoice...</Text>
                </VStack>
            </DashboardLayout>
        );
    }

    if (error || !invoice) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch" py={8}>
                    <Text color="red.500">Error: {error || "Invoice not found"}</Text>
                    <Link href="/dashboard/invoices">
                        <Button variant="outline" size="sm">
                            <LuArrowLeft /> Back to Invoices
                        </Button>
                    </Link>
                </VStack>
            </DashboardLayout>
        );
    }


    return (
        <>
            <style jsx global>{`
                /* A4 Page Container */
                .invoice-print-content {
                    width: 210mm;
                    min-height: auto;
                    max-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 8mm 10mm 8mm;
                    }
                    
                    @page :first { margin-top: 0; }
                    @page :left { margin-left: 0; }
                    @page :right { margin-right: 0; }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        width: 210mm !important;
                        height: 297mm !important;
                    }
                    
                    body * {
                        visibility: hidden;
                    }
                    
                    .invoice-print-content,
                    .invoice-print-content * {
                        visibility: visible !important;
                    }
                    
                    .invoice-print-content {
                        position: relative !important;
                        width: 194mm !important;
                        height: 277mm !important;
                        background: white !important;
                        box-shadow: none !important;
                        overflow: hidden !important;
                        margin: 0 auto !important;
                    }
                    
                    .invoice-print-content button,
                    .invoice-print-content .chakra-button,
                    .no-print {
                        display: none !important;
                    }
                    
                    .corner-decoration {
                        position: absolute !important;
                        overflow: hidden !important;
                    }
                }
            `}</style>
            <DashboardLayout>
                <VStack gap={6} align="stretch">
                    {/* Header Actions */}
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} className="no-print">
                        <HStack gap={4}>
                            <Link href="/dashboard/invoices">
                                <IconButton variant="ghost" size="sm" aria-label="Back">
                                    <LuArrowLeft />
                                </IconButton>
                            </Link>
                            <Box>
                                <HStack gap={3}>
                                    <Heading size="lg" fontWeight="semibold">{invoice.invoiceNumber}</Heading>
                                    <Badge
                                        colorPalette={getStatusColor(invoice.status)}
                                        variant="subtle"
                                        fontSize="xs"
                                        px={3}
                                        py={1}
                                        borderRadius="full"
                                        textTransform="capitalize"
                                    >
                                        {invoice.status}
                                    </Badge>
                                </HStack>
                                <Text color="gray.500" fontSize="sm">
                                    Created on {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </Text>
                            </Box>
                        </HStack>
                        <HStack gap={2} flexWrap="wrap">
                            <Button variant="outline" size="sm" loading={isPrinting} onClick={handlePrint}>
                                <LuPrinter /> Print
                            </Button>

                            <Button variant="outline" size="sm" onClick={handleDuplicate}>
                                <LuCopy /> Duplicate
                            </Button>
                            <Link href={`/dashboard/invoices/${invoiceId}/edit`}>
                                <Button variant="outline" size="sm">
                                    <LuPencil /> Edit
                                </Button>
                            </Link>
                            <Button colorPalette="blue" size="sm" loading={isSending} loadingText="Sending..." onClick={() => setSendDialogOpen(true)}>
                                <LuSend /> Send Invoice
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Invoice Document - A4 */}
                    <Card.Root border="none" bg="white" className="invoice-print-content" overflow="hidden" position="relative">
                        <Card.Body p={0} position="relative">

                            {/* ── Top-right corner decoration ── */}
                            <Box position="absolute" top={0} right={0} w="180px" h="180px" overflow="hidden" zIndex={0} pointerEvents="none">
                                <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="180,0 180,110 70,0" fill="#1B2D4E" />
                                    <polygon points="70,0 180,110 180,135 95,0" fill="#2C4A7C" />
                                    <polygon points="95,0 180,135 180,155 115,0" fill="#7B96B4" />
                                    <polygon points="115,0 180,155 180,175 135,0" fill="#1B2D4E" opacity="0.6" />
                                </svg>
                            </Box>

                            {/* ── Bottom-left corner decoration ── */}
                            <Box position="absolute" bottom={0} left={0} w="180px" h="180px" overflow="hidden" zIndex={0} pointerEvents="none">
                                <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="0,180 110,180 0,70" fill="#1B2D4E" />
                                    <polygon points="0,70 110,180 135,180 0,95" fill="#2C4A7C" />
                                    <polygon points="0,95 135,180 155,180 0,115" fill="#7B96B4" />
                                    <polygon points="0,115 155,180 175,180 0,135" fill="#1B2D4E" opacity="0.6" />
                                </svg>
                            </Box>

                            {/* ── Invoice content ── */}
                            <Box position="relative" zIndex={1} px={10} pt={7} pb={10}>

                                {/* Logo – top right */}
                                <Flex justify="flex-end" mb={6}>
                                    <img
                                        src="/logo.png"
                                        alt="Company Logo"
                                        style={{ height: "52px", objectFit: "contain" }}
                                    />
                                </Flex>

                                {/* INVOICE heading */}
                                <Text
                                    fontSize="28px"
                                    fontWeight="800"
                                    color="#1B2D4E"
                                    letterSpacing="3px"
                                    mb={5}
                                    lineHeight="1"
                                >
                                    INVOICE
                                </Text>

                                {/* Invoice By / Invoice to – two columns */}
                                <SimpleGrid columns={2} gap={10} mb={7}>
                                    {/* Left – Invoice By */}
                                    <Box>
                                        <Text fontSize="11px" color="gray.500" mb={1} letterSpacing="0.5px">
                                            Invoice By:
                                        </Text>
                                        <Text fontWeight="700" color="#1B2D4E" fontSize="sm" textTransform="uppercase">
                                            {companyInfo.name}
                                        </Text>
                                        {currentUser?.name && (
                                            <Text color="gray.700" fontSize="sm" mt={0.5}>{invoice.createdByName || currentUser.name}</Text>
                                        )}
                                        {companyInfo.phone && (
                                            <Text color="gray.500" fontSize="sm">Contact Number:&nbsp; {companyInfo.phone}</Text>
                                        )}
                                    </Box>
                                    {/* Right – Invoice to */}
                                    <Box>
                                        <Text fontSize="11px" color="gray.500" mb={1} letterSpacing="0.5px">
                                            Invoice to:
                                        </Text>
                                        <Text fontWeight="700" color="#1B2D4E" fontSize="sm" textTransform="uppercase">
                                            {invoice.client || "Walk-in Customer"}
                                        </Text>
                                        {invoice.clientPhone && (
                                            <Text color="gray.500" fontSize="sm">{invoice.clientPhone}</Text>
                                        )}
                                        <HStack gap={6} mt={1.5}>
                                            <Box>
                                                <Text fontSize="11px" color="gray.500" letterSpacing="0.5px">Invoice Number:</Text>
                                                <Text color="gray.700" fontSize="sm" fontWeight="600">
                                                    {invoice.invoiceNumber || `INV-${invoice.id?.slice(-6)}`}
                                                </Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="11px" color="gray.500" letterSpacing="0.5px">Invoice Date:</Text>
                                                <Text color="gray.700" fontSize="sm" fontWeight="600">
                                                    {new Date(invoice.issueDate).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric'
                                                    })}
                                                </Text>
                                            </Box>
                                        </HStack>
                                    </Box>
                                </SimpleGrid>

                                {/* ── Items table ── */}
                                <Box mb={0} border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
                                    {/* Table header */}
                                    <Flex bg="#1B2D4E" px={5} py={3} align="center">
                                        <Text
                                            color="white"
                                            fontWeight="700"
                                            fontSize="11px"
                                            letterSpacing="1.5px"
                                            textTransform="uppercase"
                                            flex={1}
                                        >
                                            Product Name
                                        </Text>
                                        <Text
                                            color="white"
                                            fontWeight="700"
                                            fontSize="11px"
                                            letterSpacing="1.5px"
                                            textTransform="uppercase"
                                            textAlign="right"
                                            minW="100px"
                                        >
                                            Total Price
                                        </Text>
                                    </Flex>

                                    {/* Rows */}
                                    {invoice.items.map((item, index) => {
                                        const amount = item.amount ?? (item.quantity * item.rate);
                                        return (
                                            <Flex
                                                key={index}
                                                px={5}
                                                py={3}
                                                align="flex-start"
                                                borderBottom={index < invoice.items.length - 1 ? "1px solid" : "none"}
                                                borderColor="gray.100"
                                                bg={index % 2 === 1 ? "gray.50" : "white"}
                                            >
                                                <Box flex={1}>
                                                    <Text color="gray.800" fontSize="sm">{item.description}</Text>
                                                    {item.quantity > 1 && (
                                                        <Text fontSize="xs" color="gray.400" mt={0.5}>
                                                            {item.quantity} × QAR {item.rate.toLocaleString()}
                                                        </Text>
                                                    )}
                                                </Box>
                                                <Text
                                                    color="gray.700"
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    minW="100px"
                                                    textAlign="right"
                                                    whiteSpace="nowrap"
                                                >
                                                    QR {amount.toLocaleString()}
                                                </Text>
                                            </Flex>
                                        );
                                    })}
                                </Box>

                                {/* ── Total amount bar ── */}
                                <Flex
                                    bg="#1B2D4E"
                                    justify="center"
                                    align="center"
                                    py={3}
                                    mt={3}
                                    mb="3px"
                                >
                                    <Text color="white" fontWeight="700" fontSize="sm" letterSpacing="1.5px" textTransform="uppercase">
                                        Total Amount: QR {invoice.total.toLocaleString()}
                                    </Text>
                                </Flex>

                                {/* ── Discount bar (only if discount exists) ── */}
                                {invoice.discount > 0 && (
                                    <Flex
                                        bg="#2C4A7C"
                                        justify="center"
                                        align="center"
                                        py={2.5}
                                        mb="3px"
                                    >
                                        <Text color="white" fontWeight="600" fontSize="sm" letterSpacing="1.5px" textTransform="uppercase">
                                            Discount: QR {invoice.discount.toLocaleString()}
                                        </Text>
                                    </Flex>
                                )}

                                {/* Notes */}
                                {invoice.notes && (
                                    <Box mt={5}>
                                        <Text fontSize="xs" fontWeight="700" color="gray.500" mb={1} letterSpacing="0.5px">
                                            Note:
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">{invoice.notes}</Text>
                                    </Box>
                                )}

                                {/* ── Footer ── */}
                                <Box mt={10}>
                                    <Text fontSize="sm" color="gray.500" fontStyle="italic">Yours sincerely,</Text>
                                    <Text fontWeight="700" color="#1B2D4E" fontSize="sm" mt={1} letterSpacing="0.5px" textTransform="uppercase">
                                        {invoice.createdByName || currentUser?.name || companyInfo.name || ""}
                                    </Text>
                                    {/* Signature line */}
                                    <Box mt={4} mb={1} w="130px" h="36px" borderBottom="1.5px solid" borderColor="gray.300" />
                                    <Text fontSize="xs" color="gray.400" letterSpacing="0.3px">
                                        Thanks for your purchase
                                    </Text>
                                </Box>

                            </Box>
                        </Card.Body>
                    </Card.Root>
                </VStack>

                {/* Send Invoice Dialog */}
                <Dialog.Root open={sendDialogOpen} onOpenChange={(e) => setSendDialogOpen(e.open)}>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                        <Dialog.Positioner>
                            <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                                <Dialog.Header p={5} pb={0}>
                                    <Dialog.Title fontWeight="semibold">Send Invoice</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body p={5}>
                                    <Text color="gray.600">Send invoice {invoice?.invoiceNumber}?</Text>
                                </Dialog.Body>
                                <Dialog.Footer p={5} pt={0} gap={3}>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" size="sm">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button colorPalette="blue" size="sm" onClick={handleSend}>
                                        <LuSend /> Send
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>

                {/* Delete Invoice Dialog */}
                <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                    <Portal>
                        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                        <Dialog.Positioner>
                            <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                                <Dialog.Header p={5} pb={0}>
                                    <Dialog.Title fontWeight="semibold">Delete Invoice</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body p={5}>
                                    <Text color="gray.600">
                                        Are you sure you want to delete this invoice? This action cannot be undone.
                                    </Text>
                                </Dialog.Body>
                                <Dialog.Footer p={5} pt={0} gap={3}>
                                    <Dialog.ActionTrigger asChild>
                                        <Button variant="outline" size="sm">Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Button colorPalette="red" size="sm" onClick={handleDelete}>
                                        <LuTrash2 /> Delete
                                    </Button>
                                </Dialog.Footer>
                                <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </DashboardLayout>
        </>
    );
}
