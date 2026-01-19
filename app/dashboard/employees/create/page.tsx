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
    IconButton,
    Flex,
    Field,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import {
    LuArrowLeft,
    LuSave,
    LuUser,
    LuX,
    LuCheck,
} from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";

export default function AddEmployeePage() {
    const router = useRouter();

    // Form state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [position, setPosition] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");
    const [joinDate, setJoinDate] = useState("");
    const [manager, setManager] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);

    const handleSaveEmployee = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            toaster.create({
                title: "Missing required fields",
                description: "Please fill in all required fields",
                type: "error",
            });
            return;
        }

        setIsSaving(true);
        setSaveDialogOpen(false);
        toaster.create({
            id: "saving-employee",
            title: "Adding new employee...",
            type: "loading",
        });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toaster.dismiss("saving-employee");
        toaster.create({
            title: "Employee added successfully!",
            description: `${firstName} ${lastName} has been added to the system`,
            type: "success",
        });
        setIsSaving(false);

        // Navigate back to employees
        setTimeout(() => router.push("/dashboard/employees"), 500);
    };

    const handleDiscard = () => {
        setDiscardDialogOpen(false);
        toaster.create({
            title: "Changes discarded",
            type: "info",
        });
        router.push("/dashboard/employees");
    };

    const hasChanges =
        firstName ||
        lastName ||
        email ||
        phone ||
        position ||
        department;

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
                            onClick={() =>
                                hasChanges
                                    ? setDiscardDialogOpen(true)
                                    : router.push("/dashboard/employees")
                            }
                        >
                            <LuArrowLeft />
                        </IconButton>
                        <Box>
                            <Heading size="lg" fontWeight="semibold">
                                Add New Employee
                            </Heading>
                            <Text color="gray.500" fontSize="sm">
                                Create a new employee record
                            </Text>
                        </Box>
                    </HStack>
                    <HStack gap={2}>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                hasChanges
                                    ? setDiscardDialogOpen(true)
                                    : router.push("/dashboard/employees")
                            }
                        >
                            Cancel
                        </Button>
                        <Button
                            colorPalette="blue"
                            size="sm"
                            loading={isSaving}
                            loadingText="Adding..."
                            onClick={() => setSaveDialogOpen(true)}
                        >
                            <LuSave /> Add Employee
                        </Button>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                    {/* Main Form */}
                    <Box gridColumn={{ base: "1", lg: "span 2" }}>
                        <VStack gap={6} align="stretch">
                            {/* Personal Info */}
                            <Card.Root
                                border="1px solid"
                                borderColor="gray.100"
                                bg="white"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Personal Information
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack gap={4} align="stretch">
                                        <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                            gap={4}
                                        >
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    First Name *
                                                </Field.Label>
                                                <Input
                                                    placeholder="Enter first name"
                                                    size="sm"
                                                    value={firstName}
                                                    onChange={(e) =>
                                                        setFirstName(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Last Name *
                                                </Field.Label>
                                                <Input
                                                    placeholder="Enter last name"
                                                    size="sm"
                                                    value={lastName}
                                                    onChange={(e) =>
                                                        setLastName(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                        </SimpleGrid>

                                        <Field.Root>
                                            <Field.Label fontSize="sm">
                                                Email Address *
                                            </Field.Label>
                                            <Input
                                                type="email"
                                                placeholder="employee@company.com"
                                                size="sm"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                            />
                                        </Field.Root>

                                        <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                            gap={4}
                                        >
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Phone Number
                                                </Field.Label>
                                                <Input
                                                    placeholder="+1 (555) 000-0000"
                                                    size="sm"
                                                    value={phone}
                                                    onChange={(e) =>
                                                        setPhone(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Location
                                                </Field.Label>
                                                <Input
                                                    placeholder="City, State"
                                                    size="sm"
                                                    value={location}
                                                    onChange={(e) =>
                                                        setLocation(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                        </SimpleGrid>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Professional Info */}
                            <Card.Root
                                border="1px solid"
                                borderColor="gray.100"
                                bg="white"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Professional Information
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack gap={4} align="stretch">
                                        <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                            gap={4}
                                        >
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Position
                                                </Field.Label>
                                                <Input
                                                    placeholder="e.g., Senior Developer"
                                                    size="sm"
                                                    value={position}
                                                    onChange={(e) =>
                                                        setPosition(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Department
                                                </Field.Label>
                                                <select
                                                    value={department}
                                                    onChange={(e) =>
                                                        setDepartment(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={{
                                                        appearance: "none",
                                                        backgroundColor: "white",
                                                        border: "1px solid var(--chakra-colors-gray-200)",
                                                        borderRadius: "0.375rem",
                                                        padding: "0.5rem 0.75rem",
                                                        fontSize: "0.875rem",
                                                        width: "100%",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <option value="">
                                                        Select department
                                                    </option>
                                                    <option value="Engineering">
                                                        Engineering
                                                    </option>
                                                    <option value="Design">
                                                        Design
                                                    </option>
                                                    <option value="Product">
                                                        Product
                                                    </option>
                                                    <option value="Sales">
                                                        Sales
                                                    </option>
                                                    <option value="Marketing">
                                                        Marketing
                                                    </option>
                                                    <option value="Human Resources">
                                                        Human Resources
                                                    </option>
                                                </select>
                                            </Field.Root>
                                        </SimpleGrid>

                                        <SimpleGrid
                                            columns={{ base: 1, md: 2 }}
                                            gap={4}
                                        >
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Join Date
                                                </Field.Label>
                                                <Input
                                                    type="date"
                                                    size="sm"
                                                    value={joinDate}
                                                    onChange={(e) =>
                                                        setJoinDate(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label fontSize="sm">
                                                    Manager
                                                </Field.Label>
                                                <Input
                                                    placeholder="Manager name"
                                                    size="sm"
                                                    value={manager}
                                                    onChange={(e) =>
                                                        setManager(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </Field.Root>
                                        </SimpleGrid>

                                        <Field.Root>
                                            <Field.Label fontSize="sm">
                                                Annual Salary
                                            </Field.Label>
                                            <Input
                                                type="text"
                                                placeholder="$50,000"
                                                size="sm"
                                                value={salary}
                                                onChange={(e) =>
                                                    setSalary(e.target.value)
                                                }
                                            />
                                        </Field.Root>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>

                            {/* Additional Info */}
                            <Card.Root
                                border="1px solid"
                                borderColor="gray.100"
                                bg="white"
                            >
                                <Card.Header p={5} pb={0}>
                                    <Heading size="sm" fontWeight="semibold">
                                        Additional Information
                                    </Heading>
                                </Card.Header>
                                <Card.Body p={5}>
                                    <VStack gap={4} align="stretch">
                                        <Field.Root>
                                            <Field.Label fontSize="sm">
                                                Bio / About
                                            </Field.Label>
                                            <Textarea
                                                placeholder="Brief description about the employee..."
                                                size="sm"
                                                rows={4}
                                                value={bio}
                                                onChange={(e) =>
                                                    setBio(e.target.value)
                                                }
                                            />
                                        </Field.Root>
                                    </VStack>
                                </Card.Body>
                            </Card.Root>
                        </VStack>
                    </Box>

                    {/* Sidebar */}
                    <Box>
                        <Card.Root
                            border="1px solid"
                            borderColor="gray.100"
                            bg="white"
                            position="sticky"
                            top="80px"
                        >
                            <Card.Header p={5} pb={0}>
                                <Heading size="sm" fontWeight="semibold">
                                    Preview
                                </Heading>
                            </Card.Header>
                            <Card.Body p={5}>
                                <VStack gap={4} align="stretch">
                                    <Box
                                        textAlign="center"
                                        py={6}
                                        bg="blue.50"
                                        borderRadius="xl"
                                    >
                                        <Box
                                            w={16}
                                            h={16}
                                            mx="auto"
                                            bg="blue.100"
                                            borderRadius="xl"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            color="blue.500"
                                            mb={3}
                                        >
                                            <LuUser size={32} />
                                        </Box>
                                        <Text fontWeight="semibold">
                                            {firstName && lastName
                                                ? `${firstName} ${lastName}`
                                                : "Employee Name"}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            color="gray.500"
                                        >
                                            {position || "Position"}
                                        </Text>
                                    </Box>
                                    <VStack gap={2} align="stretch">
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">
                                                Department
                                            </Text>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {department || "-"}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">
                                                Email
                                            </Text>
                                            <Text
                                                fontSize="xs"
                                                fontWeight="medium"

                                            >
                                                {email || "-"}
                                            </Text>
                                        </HStack>
                                        <HStack justify="space-between">
                                            <Text fontSize="sm" color="gray.600">
                                                Salary
                                            </Text>
                                            <Text fontSize="sm" fontWeight="medium">
                                                {salary || "-"}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    </Box>
                </SimpleGrid>
            </VStack>

            {/* Save Confirmation Dialog */}
            <Dialog.Root
                open={saveDialogOpen}
                onOpenChange={(e) => setSaveDialogOpen(e.open)}
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
                                    Add Employee
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    Are you sure you want to add{" "}
                                    <strong>
                                        {firstName} {lastName}
                                    </strong>{" "}
                                    to the system?
                                </Text>
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
                                    onClick={handleSaveEmployee}
                                >
                                    <LuCheck /> Add Employee
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
            <Dialog.Root
                open={discardDialogOpen}
                onOpenChange={(e) => setDiscardDialogOpen(e.open)}
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
                                    Discard Changes
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600">
                                    You have unsaved changes. Are you sure you
                                    want to discard them?
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer p={5} pt={0} gap={3}>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Keep Editing
                                    </Button>
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
        </DashboardLayout>
    );
}
