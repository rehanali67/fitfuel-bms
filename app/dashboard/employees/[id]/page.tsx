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
    Badge,
    SimpleGrid,
    Separator,
    Avatar,
    IconButton,
    Flex,
    Dialog,
    Portal,
    CloseButton,
    Field,
    Input,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuPencil,
    LuTrash2,
    LuMail,
    LuPhone,
    LuMapPin,
    LuCalendar,
    LuBriefcase,
    LuBuilding2,
    LuDownload,
    LuX,
} from "react-icons/lu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";

// Mock employee data
const employeeData = {
    id: "EMP-001",
    name: "John Smith",
    email: "john.smith@company.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Developer",
    department: "Engineering",
    joinDate: "January 15, 2023",
    status: "active" as const,
    salary: "$85,000",
    manager: "Sarah Johnson",
    location: "New York, NY",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    bio: "Experienced full-stack developer with 8+ years in web development and cloud technologies.",
    skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    workingHours: "9:00 AM - 5:00 PM EST",
};

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

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const employeeId = params.id;

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState(employeeData.status);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChangeStatus = async () => {
        setIsProcessing(true);
        setStatusDialogOpen(false);
        toaster.create({
            id: "changing-status",
            title: "Updating status...",
            type: "loading",
        });

        await new Promise((resolve) => setTimeout(resolve, 1000));

        toaster.dismiss("changing-status");
        toaster.create({
            title: "Status updated",
            description: `Employee status changed to ${newStatus}`,
            type: "success",
        });
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        setDeleteDialogOpen(false);
        toaster.create({
            id: "deleting-employee",
            title: "Removing employee...",
            type: "loading",
        });

        await new Promise((resolve) => setTimeout(resolve, 1500));

        toaster.dismiss("deleting-employee");
        toaster.create({
            title: "Employee removed",
            description: "The employee has been deleted from the system",
            type: "success",
        });

        router.push("/dashboard/employees");
    };

    const handleDownloadData = async () => {
        toaster.create({
            id: "downloading",
            title: "Generating employee report...",
            type: "loading",
        });

        await new Promise((resolve) => setTimeout(resolve, 1200));

        toaster.dismiss("downloading");
        toaster.create({
            title: "Report downloaded",
            description: "Employee profile PDF generated",
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
                    <HStack gap={4}>
                        <Link href="/dashboard/employees">
                            <IconButton variant="ghost" size="sm" aria-label="Back">
                                <LuArrowLeft />
                            </IconButton>
                        </Link>
                        <Box>
                            <Heading size="lg" fontWeight="semibold">
                                {employeeData.name}
                            </Heading>
                            <Text color="fg.muted" fontSize="sm">
                                {employeeData.position} • {employeeData.department}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadData}
                        >
                            <LuDownload /> Download
                        </Button>
                        <Link href={`/dashboard/employees/${employeeId}/edit`}>
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
                            {/* Personal Info */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Personal Information
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={4}>
                                        <HStack gap={4}>
                                            <Avatar.Root size="xl">
                                                <Avatar.Image
                                                    src={employeeData.avatar}
                                                />
                                                <Avatar.Fallback
                                                    name={employeeData.name}
                                                />
                                            </Avatar.Root>
                                            <VStack align="start" gap={1}>
                                                <Text fontSize="sm" color="fg.muted">
                                                    Employee ID
                                                </Text>
                                                <Text fontWeight="semibold">
                                                    {employeeData.id}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                        <Separator />
                                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuMail size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Email
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm">
                                                    {employeeData.email}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuPhone size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Phone
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm">
                                                    {employeeData.phone}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuMapPin size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Location
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm">
                                                    {employeeData.location}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuCalendar size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Join Date
                                                    </Text>
                                                </HStack>
                                                <Text fontSize="sm">
                                                    {employeeData.joinDate}
                                                </Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Professional Info */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Professional Information
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={4}>
                                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuBriefcase size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Position
                                                    </Text>
                                                </HStack>
                                                <Text fontWeight="medium">
                                                    {employeeData.position}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <HStack gap={2}>
                                                    <LuBuilding2 size={16} />
                                                    <Text fontSize="xs" color="fg.muted">
                                                        Department
                                                    </Text>
                                                </HStack>
                                                <Badge
                                                    variant="subtle"
                                                    fontSize="xs"
                                                    px={2}
                                                    py={0.5}
                                                    borderRadius="full"
                                                >
                                                    {employeeData.department}
                                                </Badge>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <Text fontSize="xs" color="fg.muted">
                                                    Manager
                                                </Text>
                                                <Text fontSize="sm">
                                                    {employeeData.manager}
                                                </Text>
                                            </VStack>
                                            <VStack align="start" gap={1}>
                                                <Text fontSize="xs" color="fg.muted">
                                                    Working Hours
                                                </Text>
                                                <Text fontSize="sm">
                                                    {employeeData.workingHours}
                                                </Text>
                                            </VStack>
                                        </SimpleGrid>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Skills */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Skills
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <HStack gap={2} flexWrap="wrap">
                                        {employeeData.skills.map((skill) => (
                                            <Badge
                                                key={skill}
                                                colorPalette="blue"
                                                variant="subtle"
                                                fontSize="xs"
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                            >
                                                {skill}
                                            </Badge>
                                        ))}
                                    </HStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Bio */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        About
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <Text fontSize="sm" color="fg.default">
                                        {employeeData.bio}
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>

                    {/* Sidebar */}
                    <Box>
                        <VStack gap={6} align="stretch">
                            {/* Status Card */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Status
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={4}>
                                        <HStack justify="space-between" align="start">
                                            <Text fontSize="sm" color="fg.muted">
                                                Current Status
                                            </Text>
                                            <Badge
                                                colorPalette={getStatusColor(
                                                    employeeData.status
                                                )}
                                                variant="subtle"
                                                fontSize="xs"
                                                px={3}
                                                py={1}
                                                borderRadius="full"
                                                textTransform="capitalize"
                                            >
                                                {employeeData.status}
                                            </Badge>
                                        </HStack>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setStatusDialogOpen(true)
                                            }
                                        >
                                            Change Status
                                        </Button>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Salary Card */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Compensation
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack align="stretch" gap={3}>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="fg.muted">
                                                Annual Salary
                                            </Text>
                                            <Text
                                                fontWeight="semibold"
                                                color="green.600"
                                            >
                                                {employeeData.salary}
                                            </Text>
                                        </HStack>
                                        <Separator />
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="fg.muted">
                                                Tenure
                                            </Text>
                                            <Text fontWeight="medium">
                                                2 years
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Quick Actions */}
                            <Card.Root
                                border="1px solid"
                                borderColor="border.default"
                                bg="bg.surface"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Actions
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack gap={2} align="stretch">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            fontSize="sm"
                                        >
                                            Send Email
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            fontSize="sm"
                                        >
                                            Schedule Review
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            fontSize="sm"
                                            colorPalette="orange"
                                        >
                                            Request Documents
                                        </Button>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Change Status Dialog */}
            <Dialog.Root
                open={statusDialogOpen}
                onOpenChange={(e) => setStatusDialogOpen(e.open)}
            >
                <Portal>
                    <Dialog.Backdrop
                        bg="blackAlpha.600"
                        backdropFilter="blur(4px)"
                    />
                    <Dialog.Positioner>
                        <Dialog.Content
                            bg="bg.surface"
                            borderRadius="xl"
                            maxW="400px"
                            mx={4}
                        >
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">
                                    Change Employee Status
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <VStack gap={4} align="stretch">
                                    <Field.Root>
                                        <Field.Label fontSize="sm">
                                            New Status
                                        </Field.Label>
                                        <Input
                                            as="select"
                                            size="sm"
                                            value={newStatus}
                                            onChange={(e) =>
                                                setNewStatus(
                                                    e.target
                                                        .value as typeof newStatus
                                                )
                                            }
                                        >
                                            <option value="active">
                                                Active
                                            </option>
                                            <option value="on-leave">
                                                On Leave
                                            </option>
                                            <option value="inactive">
                                                Inactive
                                            </option>
                                        </Input>
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    loading={isProcessing}
                                    onClick={handleChangeStatus}
                                >
                                    Update Status
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger asChild position="absolute" top={3} right={3}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

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
                            bg="bg.surface"
                            borderRadius="xl"
                            maxW="400px"
                            mx={4}
                        >
                            <Dialog.Header p={5} pb={0}>
                                <Dialog.Title fontWeight="semibold">
                                    Delete Employee
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="fg.muted">
                                    Are you sure you want to remove{" "}
                                    <strong>{employeeData.name}</strong> from the
                                    system? This action cannot be undone.
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
                                    loading={isProcessing}
                                    onClick={handleDelete}
                                >
                                    <LuTrash2 /> Delete Employee
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
