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
    Separator,
    Dialog,
    Portal,
    CloseButton,
    Input,
    Field,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuPencil,
    LuTrash2,
    LuPackage,
    LuPlus,
    LuMinus,
    LuHistory,
    LuCheck,
} from "react-icons/lu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { ProductResponse } from "@/lib/models/Product";
import type { StockHistoryResponse } from "@/lib/models/StockHistory";

const getStatusColor = (status: string) => {
    switch (status) {
        case "In Stock": return "green";
        case "Low Stock": return "yellow";
        case "Out of Stock": return "red";
        default: return "gray";
    }
};

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    // Product data state
    const [product, setProduct] = useState<ProductResponse | null>(null);
    const [stockHistory, setStockHistory] = useState<StockHistoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // UI state
    const [stockAmount, setStockAmount] = useState("");
    const [stockNote, setStockNote] = useState("");
    const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
    const [removeStockDialogOpen, setRemoveStockDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Fetch product data
    useEffect(() => {
        fetchProduct();
        fetchStockHistory();
    }, [productId]);

    const fetchProduct = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<ProductResponse>(`/api/inventory/${productId}`);
            if (response.success && response.data) {
                setProduct(response.data);
            } else {
                throw new Error(response.error || "Failed to load product");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load product",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
            router.push("/dashboard/inventory");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStockHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await apiClient.get<StockHistoryResponse[]>(`/api/inventory/${productId}/stock-history`);
            if (response.success && response.data) {
                setStockHistory(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch stock history:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    if (isLoading || !product) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch" py={8}>
                    <Text>Loading product...</Text>
                </VStack>
            </DashboardLayout>
        );
    }


    const handleAddStock = async () => {
        const amount = parseInt(stockAmount);
        if (!amount || amount <= 0) {
            toaster.create({
                title: "Please enter a valid quantity",
                type: "error",
            });
            return;
        }

        setIsProcessing(true);
        setAddStockDialogOpen(false);
        toaster.create({
            id: "adding-stock",
            title: "Adding stock...",
            type: "loading",
        });

        try {
            const response = await apiClient.post<ProductResponse>(`/api/inventory/${productId}/adjust-stock`, {
                quantity: amount,
                type: 'manual_add',
                notes: stockNote || undefined,
            });

            if (response.success && response.data) {
                setProduct(response.data);
                await fetchStockHistory(); // Refresh history
                toaster.dismiss("adding-stock");
                toaster.create({
                    title: "Stock added!",
                    description: `Added ${amount} units to inventory`,
                    type: "success",
                });
                setStockAmount("");
                setStockNote("");
            } else {
                throw new Error(response.error || "Failed to update stock");
            }
        } catch (error) {
            toaster.dismiss("adding-stock");
            toaster.create({
                title: "Failed to add stock",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveStock = async () => {
        const amount = parseInt(stockAmount);
        if (!amount || amount <= 0) {
            toaster.create({
                title: "Please enter a valid quantity",
                type: "error",
            });
            return;
        }

        if (amount > product.stock) {
            toaster.create({
                title: "Insufficient stock",
                description: `Only ${product.stock} units available`,
                type: "error",
            });
            return;
        }

        setIsProcessing(true);
        setRemoveStockDialogOpen(false);
        toaster.create({
            id: "removing-stock",
            title: "Removing stock...",
            type: "loading",
        });

        try {
            const response = await apiClient.post<ProductResponse>(`/api/inventory/${productId}/adjust-stock`, {
                quantity: amount,
                type: 'manual_remove',
                notes: stockNote || undefined,
            });

            if (response.success && response.data) {
                setProduct(response.data);
                await fetchStockHistory(); // Refresh history
                toaster.dismiss("removing-stock");
                toaster.create({
                    title: "Stock removed!",
                    description: `Removed ${amount} units from inventory`,
                    type: "success",
                });
                setStockAmount("");
                setStockNote("");
            } else {
                throw new Error(response.error || "Failed to update stock");
            }
        } catch (error) {
            toaster.dismiss("removing-stock");
            toaster.create({
                title: "Failed to remove stock",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-product",
            title: "Deleting product...",
            type: "loading",
        });

        try {
            const response = await apiClient.delete(`/api/inventory/${productId}`);
            if (response.success) {
                toaster.dismiss("deleting-product");
                toaster.create({
                    title: "Product deleted",
                    description: `${product.name} has been removed from inventory`,
                    type: "success",
                });
                router.push("/dashboard/inventory");
            } else {
                throw new Error(response.error || "Failed to delete product");
            }
        } catch (error) {
            toaster.dismiss("deleting-product");
            toaster.create({
                title: "Failed to delete product",
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
                    <HStack gap={4}>
                        <Link href="/dashboard/inventory">
                            <IconButton variant="ghost" size="sm" aria-label="Back">
                                <LuArrowLeft />
                            </IconButton>
                        </Link>
                        <Box>
                            <HStack gap={3}>
                                <Heading size="lg" fontWeight="semibold">{product.name}</Heading>
                                <Badge
                                    colorPalette={getStatusColor(product.status)}
                                    variant="subtle"
                                    fontSize="xs"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    textTransform="capitalize"
                                >
                                    {product.status}
                                </Badge>
                            </HStack>
                            <Text color="gray.500" fontSize="sm">{product.sku}</Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Button
                            variant="outline"
                            size="sm"
                            colorPalette="green"
                            onClick={() => {
                                setStockAmount("");
                                setStockNote("");
                                setAddStockDialogOpen(true);
                            }}
                        >
                            <LuPlus /> Add Stock
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            colorPalette="red"
                            onClick={() => {
                                setStockAmount("");
                                setStockNote("");
                                setRemoveStockDialogOpen(true);
                            }}
                        >
                            <LuMinus /> Remove Stock
                        </Button>
                        <Link href={`/dashboard/inventory/${productId}/edit`}>
                            <Button variant="outline" size="sm">
                                <LuPencil /> Edit
                            </Button>
                        </Link>
                        <Button
                            colorPalette="red"
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            <LuTrash2 /> Delete
                        </Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                    {/* Main Info */}
                    <Box gridColumn={{ base: "1", lg: "span 2" }}>
                        <VStack gap={6} align="stretch">
                            {/* Product Details */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">Product Details</Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={4}>
                                        <Box>
                                            <Text fontSize="xs" color="gray.500" mb={1}>Description</Text>
                                            <Text fontSize="sm">{product.description || "No description"}</Text>
                                        </Box>
                                        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Category</Text>
                                                <Badge variant="subtle" fontSize="xs" px={2} py={0.5} borderRadius="full">
                                                    {product.category || "Uncategorized"}
                                                </Badge>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Supplier</Text>
                                                <Text fontSize="sm" fontWeight="medium">{product.supplierName || "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Location</Text>
                                                <Text fontSize="sm" fontWeight="medium">{product.location || "N/A"}</Text>
                                            </Box>
                                            <Box>
                                                <Text fontSize="xs" color="gray.500" mb={1}>Expiry Date</Text>
                                                <Text fontSize="sm" fontWeight="medium" color={product.expiryDate ? (new Date(product.expiryDate) < new Date() ? "red.600" : new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? "orange.600" : "gray.700") : "gray.500"}>
                                                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A"}
                                                </Text>
                                            </Box>
                                        </SimpleGrid>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Stock History */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <HStack justify="space-between">
                                        <Heading size="sm" fontWeight="semibold">Stock History</Heading>
                                        <Button variant="ghost" size="xs" onClick={fetchStockHistory} loading={isLoadingHistory}>
                                            <LuHistory /> Refresh
                                        </Button>
                                    </HStack>
                                </Card.Header>
                                <Card.Body p={5}>
                                    {isLoadingHistory ? (
                                        <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                            Loading history...
                                        </Text>
                                    ) : stockHistory.length > 0 ? (
                                        <VStack align="stretch" gap={3}>
                                            {stockHistory.map((entry) => {
                                                const isPositive = entry.quantity >= 0;
                                                const color = isPositive ? 'green' : 'red';
                                                return (
                                                    <HStack
                                                        key={entry.id}
                                                        justify="space-between"
                                                        p={3}
                                                        borderRadius="lg"
                                                        bg="gray.50"
                                                        _hover={{ bg: "gray.100" }}
                                                        transition="background 0.15s"
                                                    >
                                                        <VStack align="start" gap={1} flex={1}>
                                                            <HStack gap={2}>
                                                                <Badge
                                                                    colorPalette={color}
                                                                    variant="subtle"
                                                                    fontSize="xs"
                                                                >
                                                                    {entry.typeLabel}
                                                                </Badge>
                                                                <Text fontSize="sm" fontWeight="medium">
                                                                    {entry.quantityLabel} units
                                                                </Text>
                                                            </HStack>
                                                            {entry.notes && (
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {entry.notes}
                                                                </Text>
                                                            )}
                                                            {entry.reference && entry.referenceType === 'invoice' && (
                                                                <Link href={`/dashboard/invoices/${entry.reference}`}>
                                                                    <Text fontSize="xs" color="blue.500" _hover={{ textDecoration: 'underline' }}>
                                                                        Invoice {entry.reference}
                                                                    </Text>
                                                                </Link>
                                                            )}
                                                        </VStack>
                                                        <VStack align="end" gap={1}>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </Text>
                                                            <Text fontSize="xs" color="gray.500">
                                                                {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </Text>
                                                            <HStack gap={2}>
                                                                <Text fontSize="xs" color="gray.400">
                                                                    {entry.previousStock} →
                                                                </Text>
                                                                <Text fontSize="xs" fontWeight="medium" color={color + ".600"}>
                                                                    {entry.newStock}
                                                                </Text>
                                                            </HStack>
                                                        </VStack>
                                                    </HStack>
                                                );
                                            })}
                                        </VStack>
                                    ) : (
                                        <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                                            No stock history available
                                        </Text>
                                    )}
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>

                    {/* Sidebar */}
                    <Box>
                        <VStack gap={6} align="stretch">
                            {/* Stock Info */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">Stock Information</Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={4}>
                                        <Box textAlign="center" py={4} bg="orange.50" borderRadius="xl">
                                            <HStack justify="center" gap={2} mb={1}>
                                                <LuPackage size={24} color="var(--chakra-colors-orange-500)" />
                                            </HStack>
                                            <Heading size="3xl" fontWeight="bold" color="orange.600">{product.stock}</Heading>
                                            <Text fontSize="sm" color="gray.500">units in stock</Text>
                                        </Box>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Minimum Stock</Text>
                                            <Text fontSize="sm" fontWeight="medium">{product.minStock || 0} units</Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Stock Status</Text>
                                            <Badge
                                                colorPalette={getStatusColor(product.status)}
                                                variant="subtle"
                                                fontSize="xs"
                                                px={2}
                                                py={0.5}
                                                borderRadius="full"
                                            >
                                                {product.status}
                                            </Badge>
                                        </HStack>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Pricing */}
                            <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">Pricing</Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={3}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">Selling Price</Text>
                                            <Text fontSize="sm" fontWeight="semibold">QAR {product.sellingPrice.toFixed(2)}</Text>
                                        </HStack>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Add Stock Dialog */}
            <Dialog.Root open={addStockDialogOpen} onOpenChange={(e) => setAddStockDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Add Stock</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <VStack gap={4} align="stretch">
                                    <Text color="gray.600" fontSize="sm">
                                        Current stock: <strong>{product.stock} units</strong>
                                    </Text>
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Quantity to Add</Field.Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter quantity"
                                            size="sm"
                                            value={stockAmount}
                                            onChange={(e) => setStockAmount(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Note (optional)</Field.Label>
                                        <Input
                                            placeholder="e.g., Regular restock"
                                            size="sm"
                                            value={stockNote}
                                            onChange={(e) => setStockNote(e.target.value)}
                                        />
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="green"
                                    size="sm"
                                    loading={isProcessing}
                                    onClick={handleAddStock}
                                >
                                    <LuPlus /> Add Stock
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Remove Stock Dialog */}
            <Dialog.Root open={removeStockDialogOpen} onOpenChange={(e) => setRemoveStockDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Remove Stock</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <VStack gap={4} align="stretch">
                                    <Text color="gray.600" fontSize="sm">
                                        Current stock: <strong>{product.stock} units</strong>
                                    </Text>
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Quantity to Remove</Field.Label>
                                        <Input
                                            type="number"
                                            placeholder="Enter quantity"
                                            size="sm"
                                            value={stockAmount}
                                            onChange={(e) => setStockAmount(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Reason (optional)</Field.Label>
                                        <Input
                                            placeholder="e.g., Sold to customer"
                                            size="sm"
                                            value={stockNote}
                                            onChange={(e) => setStockNote(e.target.value)}
                                        />
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="red"
                                    size="sm"
                                    loading={isProcessing}
                                    onClick={handleRemoveStock}
                                >
                                    <LuMinus /> Remove Stock
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Delete Product Dialog */}
            <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                    <Dialog.Positioner>
                        <Dialog.Content bg="white" borderRadius="xl" maxW="400px" mx={4}>
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">Delete Product</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
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
                                    <LuTrash2 /> Delete Product
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
