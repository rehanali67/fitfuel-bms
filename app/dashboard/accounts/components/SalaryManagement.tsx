"use client";

import {
    Box,
    Card,
    HStack,
    VStack,
    Text,
    Heading,
    Badge,
    Button,
    Input,
    Textarea,
    Flex,
    Table,
    IconButton,
    NativeSelect,
    Field,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuTrash2,
    LuChevronDown,
    LuChevronRight,
    LuUser,
} from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { useState } from "react";
import type { UserResponse } from "@/lib/models/User";
import type { SalaryPaymentResponse } from "@/lib/models/SalaryPayment";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function fmt(n: number) {
    return `QAR ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface SalaryManagementProps {
    employees: UserResponse[];
    payments: SalaryPaymentResponse[];
    isLoading: boolean;
    onPaySalary: (
        employeeId: string,
        amount: number,
        month: number,
        year: number,
        notes?: string
    ) => Promise<void>;
    onDeletePayment: (id: string) => Promise<void>;
}

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function SalaryManagement({
    employees,
    payments,
    isLoading,
    onPaySalary,
    onDeletePayment,
}: SalaryManagementProps) {
    const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
    const [payDialogOpen, setPayDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<UserResponse | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<SalaryPaymentResponse | null>(null);
    const [payLoading, setPayLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Form state for pay dialog
    const [amount, setAmount] = useState("");
    const [month, setMonth] = useState(String(currentMonth));
    const [year, setYear] = useState(String(currentYear));
    const [notes, setNotes] = useState("");

    function openPayDialog(emp: UserResponse) {
        setSelectedEmployee(emp);
        const defaultAmount = "";
        setAmount(defaultAmount);
        setMonth(String(currentMonth));
        setYear(String(currentYear));
        setNotes("");
        setPayDialogOpen(true);
    }

    function openDeleteDialog(payment: SalaryPaymentResponse) {
        setSelectedPayment(payment);
        setDeleteDialogOpen(true);
    }

    async function handlePay() {
        if (!selectedEmployee) return;
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            toaster.create({ description: "Enter a valid amount.", type: "error" });
            return;
        }
        setPayLoading(true);
        try {
            await onPaySalary(
                selectedEmployee.id,
                parsedAmount,
                parseInt(month),
                parseInt(year),
                notes || undefined
            );
            setPayDialogOpen(false);
        } finally {
            setPayLoading(false);
        }
    }

    async function handleDelete() {
        if (!selectedPayment) return;
        setDeleteLoading(true);
        try {
            await onDeletePayment(selectedPayment.id);
            setDeleteDialogOpen(false);
        } finally {
            setDeleteLoading(false);
        }
    }

    function paymentsFor(employeeId: string) {
        return payments.filter((p) => p.employeeId === employeeId);
    }

    function totalPaidFor(employeeId: string) {
        return paymentsFor(employeeId).reduce((s, p) => s + p.amount, 0);
    }

    return (
        <>
            <Card.Root bg="bg.surface" borderWidth="1px" borderColor="border.default">
                <Card.Header p={5} pb={3}>
                    <Heading size="sm" fontWeight="semibold">Salary Management</Heading>
                    <Text fontSize="xs" color="fg.subtle" mt={1}>
                        Record salary payments per employee
                    </Text>
                </Card.Header>
                <Card.Body p={0}>
                    {isLoading ? (
                        <Box p={8} textAlign="center">
                            <Text color="fg.subtle" fontSize="sm">Loading users...</Text>
                        </Box>
                    ) : employees.length === 0 ? (
                        <Box p={8} textAlign="center">
                            <Text color="fg.subtle" fontSize="sm">No users found.</Text>
                        </Box>
                    ) : (
                        <Box overflowX="auto">
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="bg.subtle">
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold" w="40px" />
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold">User</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold">Role</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold" textAlign="right">Total Paid</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold" textAlign="right">Payments</Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontSize="xs" color="fg.muted" textTransform="uppercase" fontWeight="semibold" />
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {employees
                                        .filter((e) => e.role === "user")
                                        .map((emp) => {
                                            const empPayments = paymentsFor(emp.id);
                                            const isExpanded = expandedEmployee === emp.id;

                                            return (
                                                <>
                                                    <Table.Row
                                                        key={emp.id}
                                                        _hover={{ bg: "bg.subtle" }}
                                                        cursor={empPayments.length > 0 ? "pointer" : "default"}
                                                        onClick={() => {
                                                            if (empPayments.length > 0) {
                                                                setExpandedEmployee(isExpanded ? null : emp.id);
                                                            }
                                                        }}
                                                    >
                                                        <Table.Cell px={5} py={3} w="40px">
                                                            {empPayments.length > 0 ? (
                                                                <Box color="fg.subtle" fontSize="sm">
                                                                    {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
                                                                </Box>
                                                            ) : null}
                                                        </Table.Cell>
                                                        <Table.Cell px={5} py={3}>
                                                            <HStack gap={3}>
                                                                <Flex
                                                                    w={8}
                                                                    h={8}
                                                                    borderRadius="full"
                                                                    bg="blue.500/10"
                                                                    align="center"
                                                                    justify="center"
                                                                    flexShrink={0}
                                                                >
                                                                    <Box color="blue.500" fontSize="sm"><LuUser /></Box>
                                                                </Flex>
                                                                <VStack gap={0} align="flex-start">
                                                                    <Text fontSize="sm" fontWeight="medium">{emp.name}</Text>
                                                                    <Text fontSize="xs" color="fg.subtle">{emp.email}</Text>
                                                                </VStack>
                                                            </HStack>
                                                        </Table.Cell>
                                                        <Table.Cell px={5} py={3}>
                                                            <Badge
                                                                colorPalette={
                                                                    emp.role === "admin" ? "red" :
                                                                        emp.role === "manager" ? "purple" : "blue"
                                                                }
                                                                variant="subtle"
                                                                textTransform="capitalize"
                                                            >
                                                                {emp.role}
                                                            </Badge>
                                                        </Table.Cell>
                                                        <Table.Cell px={5} py={3} textAlign="right">
                                                            <Text fontSize="sm" color="orange.600" fontWeight="medium">
                                                                {empPayments.length > 0 ? fmt(totalPaidFor(emp.id)) : "—"}
                                                            </Text>
                                                        </Table.Cell>
                                                        <Table.Cell px={5} py={3} textAlign="right">
                                                            <Badge colorPalette="blue" variant="subtle">{empPayments.length}</Badge>
                                                        </Table.Cell>
                                                        <Table.Cell px={5} py={3} textAlign="right">
                                                            <Button
                                                                size="xs"
                                                                colorPalette="green"
                                                                variant="outline"
                                                                onClick={(e) => { e.stopPropagation(); openPayDialog(emp); }}
                                                            >
                                                                <LuPlus /> Record Payment
                                                            </Button>
                                                        </Table.Cell>
                                                    </Table.Row>

                                                    {/* Expanded payment history */}
                                                    {isExpanded && empPayments.map((pmt) => (
                                                        <Table.Row key={pmt.id} bg="bg.subtle">
                                                            <Table.Cell px={5} py={2} />
                                                            <Table.Cell px={5} py={2} colSpan={2}>
                                                                <Text fontSize="xs" color="fg.muted">
                                                                    {pmt.monthLabel}
                                                                    {pmt.notes && ` — ${pmt.notes}`}
                                                                </Text>
                                                                <Text fontSize="xs" color="fg.subtle">
                                                                    Recorded: {new Date(pmt.createdAt).toLocaleDateString()}
                                                                </Text>
                                                            </Table.Cell>
                                                            <Table.Cell px={5} py={2} colSpan={2}>
                                                                <Text fontSize="xs" fontWeight="medium" color="orange.600">
                                                                    {fmt(pmt.amount)}
                                                                </Text>
                                                            </Table.Cell>
                                                            <Table.Cell px={5} py={2} />
                                                            <Table.Cell px={5} py={2} textAlign="right">
                                                                <IconButton
                                                                    size="xs"
                                                                    colorPalette="red"
                                                                    variant="ghost"
                                                                    aria-label="Delete payment"
                                                                    onClick={(e) => { e.stopPropagation(); openDeleteDialog(pmt); }}
                                                                >
                                                                    <LuTrash2 />
                                                                </IconButton>
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </>
                                            );
                                        })}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    )}
                </Card.Body>
            </Card.Root>

            {/* Pay salary dialog */}
            <Dialog.Root open={payDialogOpen} onOpenChange={(e) => setPayDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Record Salary Payment — {selectedEmployee?.name}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <VStack gap={4} align="stretch">
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Amount (QAR)</Field.Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min={0}
                                        />
                                    </Field.Root>
                                    <HStack gap={3}>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm">Month</Field.Label>
                                            <NativeSelect.Root>
                                                <NativeSelect.Field value={month} onChange={(e) => setMonth(e.target.value)}>
                                                    {MONTHS.map((m, i) => (
                                                        <option key={m} value={i + 1}>{m}</option>
                                                    ))}
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </Field.Root>
                                        <Field.Root flex={1}>
                                            <Field.Label fontSize="sm">Year</Field.Label>
                                            <NativeSelect.Root>
                                                <NativeSelect.Field value={year} onChange={(e) => setYear(e.target.value)}>
                                                    {YEARS.map((y) => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </NativeSelect.Field>
                                                <NativeSelect.Indicator />
                                            </NativeSelect.Root>
                                        </Field.Root>
                                    </HStack>
                                    <Field.Root>
                                        <Field.Label fontSize="sm">Notes (optional)</Field.Label>
                                        <Textarea
                                            placeholder="e.g. Bonus, overtime..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={3}
                                        />
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" colorPalette="gray" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button colorPalette="green" size="sm" onClick={handlePay} loading={payLoading}>
                                    Record Payment
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Delete payment dialog */}
            <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Delete Payment Record</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text fontSize="sm" color="fg.muted">
                                    Are you sure you want to delete the payment of{" "}
                                    <Text as="span" fontWeight="bold">{selectedPayment ? fmt(selectedPayment.amount) : ""}</Text>{" "}
                                    for <Text as="span" fontWeight="bold">{selectedPayment?.monthLabel}</Text>?
                                    This action cannot be undone.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" colorPalette="gray" size="sm">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Button colorPalette="red" size="sm" onClick={handleDelete} loading={deleteLoading}>
                                    Delete
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={2} right={2}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}
