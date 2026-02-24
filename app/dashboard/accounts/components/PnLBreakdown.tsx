"use client";

import {
    Card,
    HStack,
    VStack,
    Text,
    Heading,
    Box,
    Badge,
    Table,
    Flex,
} from "@chakra-ui/react";
import { PnLPeriod } from "./PnLOverview";

interface PeriodBucket {
    label: string;
    revenue: number;
    expenses: number;
    net: number;
    invoiceCount: number;
}

interface PnLBreakdownProps {
    breakdown: PeriodBucket[];
    period: PnLPeriod;
    isLoading: boolean;
}

function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <Box w="full" bg="gray.100" borderRadius="full" h="6px" overflow="hidden">
            <Box
                w={`${pct}%`}
                h="full"
                bg={`${color}.400`}
                borderRadius="full"
                transition="width 0.4s ease"
            />
        </Box>
    );
}

export default function PnLBreakdown({ breakdown, period, isLoading }: PnLBreakdownProps) {
    const maxRevenue = Math.max(...breakdown.map((b) => b.revenue), 1);
    const maxExpenses = Math.max(...breakdown.map((b) => b.expenses), 1);
    const maxAbs = Math.max(maxRevenue, maxExpenses);

    const periodLabel =
        period === "daily" ? "Day" :
            period === "weekly" ? "Week" :
                period === "monthly" ? "Month" : "Year";

    return (
        <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
            <Card.Header p={5} pb={3}>
                <Heading size="sm" fontWeight="semibold">
                    P&L Breakdown
                </Heading>
                <Text fontSize="xs" color="gray.400" mt={1}>
                    Revenue vs expenses per {periodLabel.toLowerCase()}
                </Text>
            </Card.Header>
            <Card.Body p={0}>
                {isLoading ? (
                    <Box p={8} textAlign="center">
                        <Text color="gray.400" fontSize="sm">Loading breakdown...</Text>
                    </Box>
                ) : (
                    <>
                        {/* Visual bar chart */}
                        <Box px={5} pb={4} overflowX="auto">
                            <Box minW={breakdown.length > 8 ? `${breakdown.length * 60}px` : "100%"}>
                                <HStack align="flex-end" gap={1} h="120px" mb={2}>
                                    {breakdown.map((b) => {
                                        const revH = maxAbs > 0 ? (b.revenue / maxAbs) * 100 : 0;
                                        const expH = maxAbs > 0 ? (b.expenses / maxAbs) * 100 : 0;
                                        return (
                                            <VStack
                                                key={b.label}
                                                flex={1}
                                                gap={0}
                                                align="center"
                                                justify="flex-end"
                                                h="100%"
                                                title={`${b.label}\nRevenue: QAR ${fmt(b.revenue)}\nExpenses: QAR ${fmt(b.expenses)}\nNet: QAR ${fmt(b.net)}`}
                                            >
                                                <HStack gap="2px" align="flex-end" h="full">
                                                    <Box
                                                        w="8px"
                                                        bg="green.400"
                                                        borderRadius="sm"
                                                        h={`${revH}%`}
                                                        minH={b.revenue > 0 ? "2px" : "0"}
                                                        transition="height 0.3s ease"
                                                    />
                                                    <Box
                                                        w="8px"
                                                        bg="orange.400"
                                                        borderRadius="sm"
                                                        h={`${expH}%`}
                                                        minH={b.expenses > 0 ? "2px" : "0"}
                                                        transition="height 0.3s ease"
                                                    />
                                                </HStack>
                                            </VStack>
                                        );
                                    })}
                                </HStack>
                                {/* x-axis labels */}
                                <HStack gap={1}>
                                    {breakdown.map((b) => (
                                        <Text
                                            key={b.label}
                                            flex={1}
                                            fontSize="9px"
                                            color="gray.400"
                                            textAlign="center"
                                            lineHeight="1.2"
                                            overflow="hidden"
                                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                                        >
                                            {b.label}
                                        </Text>
                                    ))}
                                </HStack>
                            </Box>
                            {/* Legend */}
                            <HStack gap={4} mt={3}>
                                <HStack gap={1}>
                                    <Box w={3} h={3} bg="green.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.500">Revenue</Text>
                                </HStack>
                                <HStack gap={1}>
                                    <Box w={3} h={3} bg="orange.400" borderRadius="sm" />
                                    <Text fontSize="xs" color="gray.500">Expenses</Text>
                                </HStack>
                            </HStack>
                        </Box>

                        {/* Table */}
                        <Box overflowX="auto">
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="gray.50">
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="semibold">
                                            {periodLabel}
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="semibold" textAlign="right">
                                            Revenue
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="semibold" textAlign="right">
                                            Expenses
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="semibold" textAlign="right">
                                            Net
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="semibold" textAlign="right">
                                            Invoices
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {[...breakdown].reverse().map((b, i) => {
                                        const isProfit = b.net >= 0;
                                        return (
                                            <Table.Row key={b.label + i} _hover={{ bg: "gray.50" }}>
                                                <Table.Cell px={5} py={3}>
                                                    <Text fontSize="sm" fontWeight="medium">{b.label}</Text>
                                                </Table.Cell>
                                                <Table.Cell px={5} py={3} textAlign="right">
                                                    <Text fontSize="sm" color="green.600" fontWeight="medium">
                                                        QAR {fmt(b.revenue)}
                                                    </Text>
                                                </Table.Cell>
                                                <Table.Cell px={5} py={3} textAlign="right">
                                                    <Text fontSize="sm" color="orange.600">
                                                        QAR {fmt(b.expenses)}
                                                    </Text>
                                                </Table.Cell>
                                                <Table.Cell px={5} py={3} textAlign="right">
                                                    <Badge
                                                        colorPalette={isProfit ? "green" : "red"}
                                                        variant="subtle"
                                                        fontSize="xs"
                                                    >
                                                        {isProfit ? "+" : ""}QAR {fmt(b.net)}
                                                    </Badge>
                                                </Table.Cell>
                                                <Table.Cell px={5} py={3} textAlign="right">
                                                    <Text fontSize="sm" color="gray.500">{b.invoiceCount}</Text>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </>
                )}
            </Card.Body>
        </Card.Root>
    );
}
