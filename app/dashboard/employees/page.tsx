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
    Badge,
    SimpleGrid,
    Table,
    IconButton,
    Flex,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuPencil,
    LuTrash2,
    LuSearch,
    LuFilter,
    LuMail,
} from "react-icons/lu";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";

interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    joinDate: string;
    status: "active" | "inactive" | "on-leave";
}

const mockEmployees: Employee[] = [
    {
        id: "EMP-001",
        name: "John Smith",
        email: "john.smith@company.com",
        phone: "+1 (555) 123-4567",
        position: "Senior Developer",
        department: "Engineering",
        joinDate: "January 15, 2023",
        status: "active",
    },
    {
        id: "EMP-002",
        name: "Sarah Johnson",
        email: "sarah.johnson@company.com",
        phone: "+1 (555) 234-5678",
        position: "Product Manager",
        department: "Product",
        joinDate: "March 20, 2023",
        status: "active",
    },
    {
        id: "EMP-003",
        name: "Michael Brown",
        email: "michael.brown@company.com",
        phone: "+1 (555) 345-6789",
        position: "UI/UX Designer",
        department: "Design",
        joinDate: "February 10, 2023",
        status: "active",
    },
    {
        id: "EMP-004",
        name: "Emily Davis",
        email: "emily.davis@company.com",
        phone: "+1 (555) 456-7890",
        position: "Sales Manager",
        department: "Sales",
        joinDate: "June 1, 2023",
        status: "on-leave",
    },
    {
        id: "EMP-005",
        name: "David Wilson",
        email: "david.wilson@company.com",
        phone: "+1 (555) 567-8901",
        position: "HR Specialist",
        department: "Human Resources",
        joinDate: "April 5, 2023",
        status: "active",
    },
    {
        id: "EMP-006",
        name: "Jessica Martinez",
        email: "jessica.martinez@company.com",
        phone: "+1 (555) 678-9012",
        position: "QA Engineer",
        department: "Engineering",
        joinDate: "May 12, 2023",
        status: "inactive",
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "green";
        case "on-leave":
            return "yellow";
        case "inactive":
            return "red";
        default:
            return "gray";
    }
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<string>("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.position.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = selectedDepartment
            ? employee.department === selectedDepartment
            : true;

        return matchesSearch && matchesDepartment;
    });

    const departments = Array.from(
        new Set(employees.map((emp) => emp.department))
    );

    const handleDeleteEmployee = async () => {
        if (!selectedEmployee) return;

        setIsDeleting(true);
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-employee",
            title: "Deleting employee...",
            type: "loading",
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        setEmployees(employees.filter((emp) => emp.id !== selectedEmployee.id));
        toaster.dismiss("deleting-employee");
        toaster.create({
            title: "Employee deleted",
            description: `${selectedEmployee.name} has been removed`,
            type: "success",
        });
        setIsDeleting(false);
        setSelectedEmployee(null);
    };

    const handleExportEmployees = async () => {
        toaster.create({
            id: "exporting",
            title: "Exporting employee list...",
            type: "loading",
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toaster.dismiss("exporting");
        toaster.create({
            title: "Export complete",
            description: "Employee list exported to CSV",
            type: "success",
        });
    };

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex
                    justify="space-between"
                    align="center"
                    flexWrap="wrap"
                    gap={4}
                >
                    <Box>
                        <Heading size="lg" fontWeight="semibold">
                            Employees
                        </Heading>
                        <Text color="gray.500" fontSize="sm">
                            Manage your team members and their information
                        </Text>
                    </Box>
                    <HStack gap={2}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportEmployees}
                        >
                            Export List
                        </Button>
                        <Link href="/dashboard/employees/create">
                            <Button colorPalette="blue" size="sm">
                                <LuPlus /> Add Employee
                            </Button>
                        </Link>
                    </HStack>
                </Flex>

                {/* Filters */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Box position="relative">
                        <LuSearch
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--chakra-colors-gray-400)",
                            }}
                        />
                        <Input
                            placeholder="Search by name, email, or position..."
                            pl={10}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Box>
                    <Box position="relative">
                        <LuFilter
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "var(--chakra-colors-gray-400)",
                            }}
                        />
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            style={{
                                appearance: "none",
                                backgroundColor: "white",
                                border: "1px solid var(--chakra-colors-gray-200)",
                                borderRadius: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.875rem",
                                paddingLeft: "2.5rem",
                                width: "100%",
                                cursor: "pointer",
                            }}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                    </Box>
                </SimpleGrid>

                {/* Employees Table */}
                <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                    <Card.Body p={0}>
                        <Box overflowX="auto">
                            <Table.Root>
                                <Table.Header>
                                    <Table.Row bg="gray.50">
                                        <Table.ColumnHeader fontWeight="medium">
                                            Employee
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">
                                            Position
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">
                                            Department
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">
                                            Join Date
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">
                                            Status
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="medium">
                                            Actions
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {filteredEmployees.map((employee) => (
                                        <Table.Row
                                            key={employee.id}
                                            _hover={{ bg: "gray.50" }}
                                        >
                                            <Table.Cell>
                                                <VStack align="start" gap={0}>
                                                    <Text fontWeight="medium">
                                                        {employee.name}
                                                    </Text>
                                                    <Text
                                                        fontSize="xs"
                                                        color="gray.500"
                                                    >
                                                        {employee.email}
                                                    </Text>
                                                </VStack>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm">
                                                    {employee.position}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge
                                                    variant="subtle"
                                                    fontSize="xs"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                >
                                                    {employee.department}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm">
                                                    {employee.joinDate}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Badge
                                                    colorPalette={getStatusColor(
                                                        employee.status
                                                    )}
                                                    variant="subtle"
                                                    fontSize="xs"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                    textTransform="capitalize"
                                                >
                                                    {employee.status.replace(
                                                        "-",
                                                        " "
                                                    )}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <HStack gap={1}>
                                                    <Link
                                                        href={`/dashboard/employees/${employee.id}`}
                                                    >
                                                        <IconButton
                                                            variant="ghost"
                                                            size="xs"
                                                            aria-label="View"
                                                        >
                                                            <LuMail size={16} />
                                                        </IconButton>
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/employees/${employee.id}/edit`}
                                                    >
                                                        <IconButton
                                                            variant="ghost"
                                                            size="xs"
                                                            aria-label="Edit"
                                                        >
                                                            <LuPencil size={16} />
                                                        </IconButton>
                                                    </Link>
                                                    <IconButton
                                                        variant="ghost"
                                                        size="xs"
                                                        colorPalette="red"
                                                        aria-label="Delete"
                                                        onClick={() => {
                                                            setSelectedEmployee(
                                                                employee
                                                            );
                                                            setDeleteDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <LuTrash2 size={16} />
                                                    </IconButton>
                                                </HStack>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </Card.Body>
                </Card.Root>

                {/* Summary Cards */}
                <SimpleGrid
                    columns={{ base: 1, sm: 2, md: 4 }}
                    gap={4}
                >
                    <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                        <Card.Body p={5}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="gray.500">
                                    Total Employees
                                </Text>
                                <Heading size="2xl">{employees.length}</Heading>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                    <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                        <Card.Body p={5}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="gray.500">
                                    Active
                                </Text>
                                <Heading size="2xl" color="green.600">
                                    {
                                        employees.filter(
                                            (e) => e.status === "active"
                                        ).length
                                    }
                                </Heading>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                    <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                        <Card.Body p={5}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="gray.500">
                                    On Leave
                                </Text>
                                <Heading size="2xl" color="yellow.600">
                                    {
                                        employees.filter(
                                            (e) => e.status === "on-leave"
                                        ).length
                                    }
                                </Heading>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                    <Card.Root border="1px solid" borderColor="gray.100" bg="white">
                        <Card.Body p={5}>
                            <VStack align="start" gap={2}>
                                <Text fontSize="sm" color="gray.500">
                                    Departments
                                </Text>
                                <Heading size="2xl" color="blue.600">
                                    {departments.length}
                                </Heading>
                            </VStack>
                        </Card.Body>
                    </Card.Root>
                </SimpleGrid>
            </VStack>

            {/* Delete Confirmation Dialog */}
            <Dialog.Root
                open={deleteDialogOpen}
                onOpenChange={(e) => setDeleteDialogOpen(e.open)}
            >
                <Portal>
                    <Dialog.Backdrop
                        bg="blackAlpha.600"
                        backdropFilter="blur(4px)"
                    />
                    <Dialog.Positioner>
                        <Dialog.Content
                            bg="white"
                            borderRadius="xl"
                            maxW="400px"
                            mx={4}
                        >
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">
                                    Remove Employee
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    Are you sure you want to remove{" "}
                                    <strong>{selectedEmployee?.name}</strong> from
                                    the system? This action cannot be undone.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="red"
                                    size="sm"
                                    loading={isDeleting}
                                    onClick={handleDeleteEmployee}
                                >
                                    <LuTrash2 /> Remove
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
