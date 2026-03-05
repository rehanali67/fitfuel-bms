"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Card,
    HStack,
    VStack,
    Text,
    Heading,
    SimpleGrid,
    Icon,
    Flex,
    Button,
    Badge,
} from "@chakra-ui/react";
import {
    LuFileText,
    LuClipboardList,
    LuPackage,
    LuDollarSign,
    LuTrendingUp,
    LuClock,
    LuArrowRight,
    LuPlus,
} from "react-icons/lu";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiClient } from "@/lib/api";
import { DashboardStats, InvoiceResponse, Activity } from "@/types/api";

const quickActions = [
    { label: "New Invoice", href: "/dashboard/invoices/create", icon: LuFileText, color: "blue" },
    { label: "New Quotation", href: "/dashboard/quotations/create", icon: LuClipboardList, color: "purple" },
    { label: "Add Product", href: "/dashboard/inventory/create", icon: LuPackage, color: "orange" },
];

function getPaymentMethodLabel(paymentMethod: string | undefined): string {
    if (!paymentMethod) return "N/A";
    if (paymentMethod === "bank-transfer") return "Bank Transfer";
    return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1);
}

function formatTimeAgo(timestamp: Date | string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
    } else {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks}w ago`;
    }
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentInvoices, setRecentInvoices] = useState<InvoiceResponse[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsResponse, invoicesResponse, activitiesResponse] = await Promise.all([
                    apiClient.get<DashboardStats>("/api/dashboard/stats"),
                    apiClient.get<InvoiceResponse[]>("/api/dashboard/recent-invoices"),
                    apiClient.get<Activity[]>("/api/dashboard/recent-activities"),
                ]);

                if (statsResponse.success && statsResponse.data) {
                    setStats(statsResponse.data);
                }
                if (invoicesResponse.success && invoicesResponse.data) {
                    setRecentInvoices(invoicesResponse.data);
                }
                if (activitiesResponse.success && activitiesResponse.data) {
                    setActivities(activitiesResponse.data);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);



    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size="xl" fontWeight="semibold">Dashboard</Heading>
                        <Text color="fg.muted" fontSize="sm">
                            Welcome back! Here's an overview of your business.
                        </Text>
                    </Box>
                    <HStack gap={2}>
                        {quickActions.map((action) => (
                            <Link key={action.label} href={action.href}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    colorPalette={action.color}
                                >
                                    <Icon fontSize="md"><action.icon /></Icon>
                                    {action.label}
                                </Button>
                            </Link>
                        ))}
                    </HStack>
                </Flex>



                {/* Main Content Grid */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                    {/* Recent Invoices */}
                    <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                        <Card.Header pb={0}>
                            <Flex justify="space-between" align="center">
                                <VStack align="start" gap={0}>
                                    <Card.Title fontWeight="semibold">Recent Invoices</Card.Title>
                                    <Text fontSize="sm" color="fg.muted">Your latest invoice activity</Text>
                                </VStack>
                                <Link href="/dashboard/invoices">
                                    <Button variant="ghost" size="sm">
                                        View All <LuArrowRight />
                                    </Button>
                                </Link>
                            </Flex>
                        </Card.Header>
                        <Card.Body>
                            {isLoading ? (
                                <Text>Loading...</Text>
                            ) : recentInvoices.length > 0 ? (
                                <VStack gap={3} align="stretch">
                                    {recentInvoices.map((invoice) => (
                                        <Link key={invoice.id} href={`/dashboard/invoices/${invoice.id}`}>
                                            <HStack
                                                justify="space-between"
                                                p={3}
                                                borderRadius="lg"
                                                bg="bg.subtle"
                                                _hover={{ bg: "bg.muted" }}
                                                transition="background 0.15s"
                                                cursor="pointer"
                                            >
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="medium" fontSize="sm">{invoice.invoiceNumber}</Text>
                                                    <Text fontSize="xs" color="fg.muted">{invoice.client}</Text>
                                                </VStack>
                                                <VStack align="end" gap={1}>
                                                    <Text fontWeight="semibold" fontSize="sm">{invoice.amount}</Text>
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
                                                            {getPaymentMethodLabel(invoice.paymentMethod)}
                                                        </Badge>
                                                    )}
                                                </VStack>
                                            </HStack>
                                        </Link>
                                    ))}
                                </VStack>
                            ) : (
                                <Text color="fg.muted" fontSize="sm">No recent invoices</Text>
                            )}
                        </Card.Body>
                    </Card.Root>

                    {/* Quick Actions & Activity */}
                    <VStack gap={6} align="stretch">
                        {/* Quick Actions Card */}
                        <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                            <Card.Header pb={0}>
                                <VStack align="start" gap={0}>
                                    <Card.Title fontWeight="semibold">Quick Actions</Card.Title>
                                    <Text fontSize="sm" color="fg.muted">Common tasks at your fingertips</Text>
                                </VStack>
                            </Card.Header>
                            <Card.Body>
                                <VStack gap={3} align="stretch">
                                    <Link href="/dashboard/invoices/create">
                                        <HStack
                                            p={4}
                                            borderRadius="lg"
                                            bg="blue.500/10"
                                            borderWidth="1px"
                                            borderColor="blue.100"
                                            _hover={{ bg: "blue.500/20" }}
                                            transition="background 0.15s"
                                            cursor="pointer"
                                        >
                                            <Flex
                                                w={8}
                                                h={8}
                                                borderRadius="md"
                                                bg="blue.500"
                                                align="center"
                                                justify="center"
                                            >
                                                <Icon color="white"><LuPlus /></Icon>
                                            </Flex>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="medium" fontSize="sm">Create Invoice</Text>
                                                <Text fontSize="xs" color="fg.muted">Generate a new invoice for your client</Text>
                                            </VStack>
                                        </HStack>
                                    </Link>
                                    <Link href="/dashboard/quotations/create">
                                        <HStack
                                            p={4}
                                            borderRadius="lg"
                                            bg="purple.500/10"
                                            borderWidth="1px"
                                            borderColor="purple.100"
                                            _hover={{ bg: "purple.500/20" }}
                                            transition="background 0.15s"
                                            cursor="pointer"
                                        >
                                            <Flex
                                                w={8}
                                                h={8}
                                                borderRadius="md"
                                                bg="purple.500"
                                                align="center"
                                                justify="center"
                                            >
                                                <Icon color="white"><LuPlus /></Icon>
                                            </Flex>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="medium" fontSize="sm">Create Quotation</Text>
                                                <Text fontSize="xs" color="fg.muted">Prepare a quote for potential clients</Text>
                                            </VStack>
                                        </HStack>
                                    </Link>
                                    <Link href="/dashboard/inventory/create">
                                        <HStack
                                            p={4}
                                            borderRadius="lg"
                                            bg="orange.500/10"
                                            borderWidth="1px"
                                            borderColor="orange.100"
                                            _hover={{ bg: "orange.500/20" }}
                                            transition="background 0.15s"
                                            cursor="pointer"
                                        >
                                            <Flex
                                                w={8}
                                                h={8}
                                                borderRadius="md"
                                                bg="orange.500"
                                                align="center"
                                                justify="center"
                                            >
                                                <Icon color="white"><LuPlus /></Icon>
                                            </Flex>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="medium" fontSize="sm">Add Product</Text>
                                                <Text fontSize="xs" color="fg.muted">Add a new item to your inventory</Text>
                                            </VStack>
                                        </HStack>
                                    </Link>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Recent Activity */}
                        <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                            <Card.Header pb={0}>
                                <VStack align="start" gap={0}>
                                    <Card.Title fontWeight="semibold">Recent Activity</Card.Title>
                                    <Text fontSize="sm" color="fg.muted">Latest updates in your business</Text>
                                </VStack>
                            </Card.Header>
                            <Card.Body>
                                {isLoading ? (
                                    <Text color="fg.muted" fontSize="sm">Loading activities...</Text>
                                ) : activities.length > 0 ? (
                                    <VStack gap={3} align="stretch">
                                        {activities.map((activity) => (
                                            <Link key={activity.id} href={activity.link || "#"}>
                                                <HStack
                                                    gap={3}
                                                    p={activity.link ? 2 : 0}
                                                    borderRadius="lg"
                                                    _hover={activity.link ? { bg: "bg.subtle" } : {}}
                                                    transition="background 0.15s"
                                                    cursor={activity.link ? "pointer" : "default"}
                                                >
                                                    <Flex w={2} h={2} borderRadius="full" bg={`${activity.color}.500`} />
                                                    <Text fontSize="sm" flex={1}>{activity.description}</Text>
                                                    <Text fontSize="xs" color="fg.subtle" ml="auto">
                                                        {formatTimeAgo(activity.timestamp)}
                                                    </Text>
                                                </HStack>
                                            </Link>
                                        ))}
                                    </VStack>
                                ) : (
                                    <Text color="fg.muted" fontSize="sm">No recent activities</Text>
                                )}
                            </Card.Body>
                        </Card.Root>
                    </VStack>
                </SimpleGrid>
            </VStack>
        </DashboardLayout>
    );
}
