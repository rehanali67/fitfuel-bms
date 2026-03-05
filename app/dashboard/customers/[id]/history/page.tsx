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
    Table,
    IconButton,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuFileText,
    LuClipboardList,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { ClientResponse } from "@/lib/models/Client";

interface HistoryItem {
    id: string;
    type: 'invoice' | 'quotation';
    number: string;
    date: Date | string;
    amount: number;
    status: string;
    createdAt: Date | string;
}

export default function CustomerHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const customerId = params.id as string;

    const [customer, setCustomer] = useState<ClientResponse | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [customerId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [customerResponse, historyResponse] = await Promise.all([
                apiClient.get<ClientResponse>(`/api/clients/${customerId}`),
                apiClient.get<HistoryItem[]>(`/api/clients/${customerId}/history`),
            ]);

            if (customerResponse.success && customerResponse.data) {
                setCustomer(customerResponse.data);
            }

            if (historyResponse.success && historyResponse.data) {
                const historyArray = Array.isArray(historyResponse.data) ? historyResponse.data : [];
                setHistory(historyArray);
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load history",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Paid":
            case "Accepted":
                return "green";
            case "Pending":
            case "Sent":
                return "yellow";
            case "Overdue":
            case "Declined":
            case "Expired":
                return "red";
            case "Draft":
                return "gray";
            default:
                return "gray";
        }
    };

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <VStack gap={6} align="stretch">
                    <Text>Loading history...</Text>
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
                        <Link href={`/dashboard/customers/${customerId}`}>
                            <IconButton variant="ghost" size="sm" aria-label="Back">
                                <LuArrowLeft />
                            </IconButton>
                        </Link>
                        <Box>
                            <Heading size="lg" fontWeight="semibold">
                                {customer?.name || 'Customer'} History
                            </Heading>
                            <Text color="fg.muted" fontSize="sm">Transaction history and records</Text>
                        </Box>
                    </HStack>
                </Flex>

                {/* History Table */}
                <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                    <Card.Body p={0}>
                        {history.length === 0 ? (
                            <Box p={8} textAlign="center">
                                <Icon fontSize="4xl" color="fg.subtle" mb={4}>
                                    <LuFileText />
                                </Icon>
                                <Text color="fg.muted">No history found for this customer</Text>
                            </Box>
                        ) : (
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="bg.subtle">
                                        <Table.ColumnHeader fontWeight="medium">Type</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Number</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Date</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium" textAlign="right">Amount</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">Status</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium" textAlign="right">Actions</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {history.map((item) => (
                                        <Table.Row key={`${item.type}-${item.id}`} _hover={{ bg: "bg.subtle" }}>
                                            <Table.Cell>
                                                <HStack gap={2}>
                                                    <Icon color={item.type === 'invoice' ? 'blue.500' : 'purple.500'}>
                                                        {item.type === 'invoice' ? <LuFileText /> : <LuClipboardList />}
                                                    </Icon>
                                                    <Text fontSize="sm" textTransform="capitalize">{item.type}</Text>
                                                </HStack>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontWeight="medium">{item.number}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text color="fg.muted" fontSize="sm">{formatDate(item.date)}</Text>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <Text fontWeight="medium">QAR {item.amount.toLocaleString()}</Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge colorPalette={getStatusColor(item.status)}>
                                                    {item.status}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell textAlign="right">
                                                <Link href={`/dashboard/${item.type === 'invoice' ? 'invoices' : 'quotations'}/${item.id}`}>
                                                    <Button variant="ghost" size="xs">
                                                        View
                                                    </Button>
                                                </Link>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        )}
                    </Card.Body>
                </Card.Root>
            </VStack>
        </DashboardLayout>
    );
}

