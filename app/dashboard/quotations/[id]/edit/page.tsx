"use client";

import { useState } from "react";
import {
    Box,
    Card,
    HStack,
    VStack,
    Text,
    Heading,
    Button,
    Input,
    Textarea,
    SimpleGrid,
    Separator,
    IconButton,
    Flex,
    Field,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuPlus,
    LuTrash2,
    LuSave,
    LuSend,
    LuX,
    LuCheck,
} from "react-icons/lu";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";

interface QuotationItem {
    id: number;
    description: string;
    quantity: number;
    rate: number;
}

// Mock existing quotation data
const existingQuotation = {
    id: "QT-2024-001",
    clientName: "Acme Corporation",
    clientEmail: "contact@acme.com",
    clientPhone: "+1 (555) 123-4567",
    clientAddress: "123 Business Street, Suite 100, New York, NY 10001",
    items: [
        { id: 1, description: "Website Redesign", quantity: 1, rate: 5000 },
        { id: 2, description: "SEO Optimization Package", quantity: 1, rate: 1500 },
        { id: 3, description: "Monthly Maintenance (6 months)", quantity: 6, rate: 200 },
    ],
    notes: "This quotation is valid for 30 days. Prices are subject to change after the validity period.",
    terms: "50% upfront payment required to begin work. Remaining 50% due upon completion.",
};

export default function EditQuotationPage() {
    const params = useParams();
    const router = useRouter();
    const quotationId = params.id;

    const [items, setItems] = useState<QuotationItem[]>(existingQuotation.items);

    // Form state
    const [clientName, setClientName] = useState(existingQuotation.clientName);
    const [clientEmail, setClientEmail] = useState(existingQuotation.clientEmail);
    const [clientPhone, setClientPhone] = useState(existingQuotation.clientPhone);
    const [clientAddress, setClientAddress] = useState(existingQuotation.clientAddress);
    const [notes, setNotes] = useState(existingQuotation.notes);
    const [terms, setTerms] = useState(existingQuotation.terms);

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const addItem = () => {
        setItems([...items, { id: Date.now(), description: "", quantity: 1, rate: 0 }]);
        toaster.create({
            title: "Line item added",
            type: "info",
        });
    };

    const removeItem = (id: number) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
            toaster.create({
                title: "Line item removed",
                type: "info",
            });
        }
    };

    const updateItem = (id: number, field: keyof QuotationItem, value: string | number) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discount = 0;
    const total = subtotal - discount;

    const handleSave = async () => {
        if (!clientName.trim() || !clientEmail.trim()) {
            toaster.create({
                title: "Missing client information",
                description: "Please enter client name and email",
                type: "error",
            });
            return;
        }

        setIsSaving(true);
        toaster.create({
            id: "saving-quotation",
            title: "Saving changes...",
            type: "loading",
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        toaster.dismiss("saving-quotation");
        toaster.create({
            title: "Quotation updated!",
            description: "Your changes have been saved",
            type: "success",
        });
        setIsSaving(false);
    };

    const handleSend = async () => {
        if (!clientName.trim() || !clientEmail.trim()) {
            toaster.create({
                title: "Missing client information",
                description: "Please enter client name and email",
                type: "error",
            });
            setSendDialogOpen(false);
            return;
        }

        setIsSending(true);
        setSendDialogOpen(false);
        toaster.create({
            id: "sending-quotation",
            title: "Saving and sending quotation...",
            type: "loading",
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        toaster.dismiss("sending-quotation");
        toaster.create({
            title: "Quotation sent!",
            description: `Quotation has been sent to ${clientEmail}`,
            type: "success",
        });
        setIsSending(false);

        setTimeout(() => router.push(`/dashboard/quotations/${quotationId}`), 500);
    };

    const handleDiscard = () => {
        setDiscardDialogOpen(false);
        toaster.create({
            title: "Changes discarded",
            type: "info",
        });
        router.push(`/dashboard/quotations/${quotationId}`);
    };

    const handleDelete = async () => {
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-quotation",
            title: "Deleting quotation...",
            type: "loading",
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        toaster.dismiss("deleting-quotation");
        toaster.create({
            title: "Quotation deleted",
            type: "success",
        });

        router.push("/dashboard/quotations");
    };

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <HStack gap={4}>
                        <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Back"
                            onClick={() => setDiscardDialogOpen(true)}
                        >
                            <LuArrowLeft />
                        </IconButton>
                        <Box>
                            <Heading size="lg" fontWeight="semibold">Edit Quotation</Heading>
                            <Text color="gray.500" fontSize="sm">{quotationId}</Text>
                        </Box>
                    </HStack>
                    <HStack gap={2} flexWrap="wrap">
                        <Button
                            variant="ghost"
                            size="sm"
                            colorPalette="red"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <LuTrash2 /> Delete
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            loading={isSaving}
                            loadingText="Saving..."
                            onClick={handleSave}
                        >
                            <LuSave /> Save Changes
                        </Button>
                        <Button
                            colorPalette="purple"
                            size="sm"
                            loading={isSending}
                            loadingText="Sending..."
                            onClick={() => setSendDialogOpen(true)}
                        >
                            <LuSend /> Save & Send
                        </Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                    {/* Main Form */}
                    <Box gridColumn={{ base: "1", lg: "span 2" }}>
                        <VStack gap={6} align="stretch">
                            {/* Client Info */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">Client Information</Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Client Name</Field.Label>
                                            <Input
                                                placeholder="Enter client name"
                                                size="sm"
                                                value={clientName}
                                                onChange={(e) => setClientName(e.target.value)}
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Email</Field.Label>
                                            <Input
                                                placeholder="client@email.com"
                                                size="sm"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Phone</Field.Label>
                                            <Input
                                                placeholder="+1 (555) 000-0000"
                                                size="sm"
                                                value={clientPhone}
                                                onChange={(e) => setClientPhone(e.target.value)}
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Address</Field.Label>
                                            <Input
                                                placeholder="Enter address"
                                                size="sm"
                                                value={clientAddress}
                                                onChange={(e) => setClientAddress(e.target.value)}
                                            />
                                        </Field.Root>
                                    </SimpleGrid>
                                </Card.Body>
                            </Card.Root>

                            {/* Line Items */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Flex justify="space-between" align="center">
                                        <Heading size="sm" fontWeight="semibold">Line Items</Heading>
                                        <Button variant="ghost" size="xs" onClick={addItem}>
                                            <LuPlus /> Add Item
                                        </Button>
                                    </Flex>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack gap={3} align="stretch">
                                        {/* Desktop Header */}
                                        <HStack gap={3} display={{ base: "none", md: "flex" }}>
                                            <Box flex="2">
                                                <Text fontSize="xs" color="gray.500">Description</Text>
                                            </Box>
                                            <Box w="80px">
                                                <Text fontSize="xs" color="gray.500">Qty</Text>
                                            </Box>
                                            <Box w="100px">
                                                <Text fontSize="xs" color="gray.500">Rate</Text>
                                            </Box>
                                            <Box w="100px">
                                                <Text fontSize="xs" color="gray.500">Amount</Text>
                                            </Box>
                                            <Box w="32px" />
                                        </HStack>

                                        {items.map((item) => (
                                            <Box key={item.id}>
                                                {/* Desktop Layout */}
                                                <HStack gap={3} display={{ base: "none", md: "flex" }} align="center">
                                                    <Box flex="2">
                                                        <Input
                                                            placeholder="Item description"
                                                            size="sm"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                        />
                                                    </Box>
                                                    <Box w="80px">
                                                        <Input
                                                            type="number"
                                                            size="sm"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                        />
                                                    </Box>
                                                    <Box w="100px">
                                                        <Input
                                                            type="number"
                                                            size="sm"
                                                            value={item.rate}
                                                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </Box>
                                                    <Box w="100px">
                                                        <Text fontWeight="medium" py={2}>QAR {(item.quantity * item.rate).toLocaleString()}</Text>
                                                    </Box>
                                                    <IconButton
                                                        variant="ghost"
                                                        size="xs"
                                                        colorPalette="red"
                                                        aria-label="Remove"
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={items.length === 1}
                                                    >
                                                        <LuTrash2 />
                                                    </IconButton>
                                                </HStack>

                                                {/* Mobile Layout */}
                                                <Card.Root display={{ base: "block", md: "none" }} p={3} bg="gray.50" borderRadius="lg">
                                                    <VStack gap={3} align="stretch">
                                                        <Field.Root>
                                                            <Field.Label fontSize="xs">Description</Field.Label>
                                                            <Input
                                                                placeholder="Item description"
                                                                size="sm"
                                                                value={item.description}
                                                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                            />
                                                        </Field.Root>
                                                        <SimpleGrid columns={3} gap={2}>
                                                            <Field.Root>
                                                                <Field.Label fontSize="xs">Qty</Field.Label>
                                                                <Input
                                                                    type="number"
                                                                    size="sm"
                                                                    value={item.quantity}
                                                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                />
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label fontSize="xs">Rate</Field.Label>
                                                                <Input
                                                                    type="number"
                                                                    size="sm"
                                                                    value={item.rate}
                                                                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </Field.Root>
                                                            <Field.Root>
                                                                <Field.Label fontSize="xs">Amount</Field.Label>
                                                                <Text fontWeight="medium" pt={2}>QAR {(item.quantity * item.rate).toLocaleString()}</Text>
                                                            </Field.Root>
                                                        </SimpleGrid>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            colorPalette="red"
                                                            onClick={() => removeItem(item.id)}
                                                            disabled={items.length === 1}
                                                            alignSelf="flex-end"
                                                        >
                                                            <LuTrash2 /> Remove
                                                        </Button>
                                                    </VStack>
                                                </Card.Root>
                                            </Box>
                                        ))}
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Notes & Terms */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">Notes & Terms</Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Notes</Field.Label>
                                            <Textarea
                                                placeholder="Add any notes for the client..."
                                                size="sm"
                                                rows={3}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label fontSize="sm">Terms & Conditions</Field.Label>
                                            <Textarea
                                                placeholder="Payment terms, conditions, etc..."
                                                size="sm"
                                                rows={3}
                                                value={terms}
                                                onChange={(e) => setTerms(e.target.value)}
                                            />
                                        </Field.Root>
                                    </SimpleGrid>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>

                    {/* Summary Sidebar */}
                    <Box>
                        <Card.Root border="1px solid" borderColor="gray.100" bg="white" position="sticky" top="80px">
                            <Card.Header p={5} pb={0}>
                                <Heading size="sm" fontWeight="semibold">Summary</Heading>
                            </Card.Header>
                            <Card.Body p={5}>
                                <VStack gap={3} align="stretch">
                                    <HStack justify="space-between">
                                        <Text color="gray.600" fontSize="sm">Subtotal</Text>
                                        <Text fontWeight="medium">QAR {subtotal.toLocaleString()}</Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text color="gray.600" fontSize="sm">Discount</Text>
                                        <Input
                                            type="number"
                                            size="xs"
                                            w="80px"
                                            textAlign="right"
                                            placeholder="0"
                                        />
                                    </HStack>
                                    <Separator />
                                    <HStack justify="space-between">
                                        <Text fontWeight="semibold">Total</Text>
                                        <Text fontWeight="bold" fontSize="xl" color="purple.600">QAR {total.toLocaleString()}</Text>
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Send Confirmation Dialog */}
            <Dialog.Root open={sendDialogOpen} onOpenChange={(e) => setSendDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Save & Send Quotation</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    This will save your changes and send the quotation to {clientEmail || "the client"}.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="purple"
                                    size="sm"
                                    onClick={handleSend}
                                >
                                    <LuSend /> Save & Send
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Discard Confirmation Dialog */}
            <Dialog.Root open={discardDialogOpen} onOpenChange={(e) => setDiscardDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Discard Changes</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    You have unsaved changes. Are you sure you want to discard them?
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">Keep Editing</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="red"
                                    size="sm"
                                    onClick={handleDiscard}
                                >
                                    <LuX /> Discard
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Delete Quotation Dialog */}
            <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Delete Quotation</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    Are you sure you want to delete this quotation? This action cannot be undone.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="red"
                                    size="sm"
                                    onClick={handleDelete}
                                >
                                    <LuTrash2 /> Delete Quotation
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
    );
}
