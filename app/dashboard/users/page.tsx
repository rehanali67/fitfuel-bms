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
    Input,
    SimpleGrid,
    Icon,
    Flex,
    Badge,
    Table,
    Dialog,
    Portal,
    CloseButton,
    Field,
    NativeSelect,
    IconButton,
} from "@chakra-ui/react";
import {
    LuPlus,
    LuSearch,
    LuUserCog,
    LuTrash2,
    LuPencil,
    LuEye,
    LuEyeOff,
    LuShieldCheck,
    LuUser,
} from "react-icons/lu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { toaster } from "@/components/ui/toaster";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { UserResponse } from "@/lib/models/User";

function getRoleColor(role: string) {
    switch (role) {
        case "admin": return "red";
        case "user": return "blue";
        default: return "gray";
    }
}

function getRoleLabel(role: string) {
    switch (role) {
        case "admin": return "Admin";
        case "user": return "Sales";
        default: return role;
    }
}

export default function UsersPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();

    // Redirect non-admins
    useEffect(() => {
        if (currentUser && currentUser.role !== "admin") {
            router.replace("/dashboard");
        }
    }, [currentUser, router]);

    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createName, setCreateName] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createRole, setCreateRole] = useState<"admin" | "user">("user");
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    // Edit dialog
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserResponse | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState<"admin" | "user">("user");
    const [editPassword, setEditPassword] = useState("");
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserResponse | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<UserResponse[]>("/api/users");
            if (response.success && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            toaster.create({
                title: "Failed to load users",
                description: "Please try again later",
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );
    });

    // ── Create ────────────────────────────────────────────────────────────────
    const openCreateDialog = () => {
        setCreateName("");
        setCreateEmail("");
        setCreatePassword("");
        setCreateRole("user");
        setShowCreatePassword(false);
        setCreateDialogOpen(true);
    };

    const handleCreate = async () => {
        if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
            toaster.create({ title: "Please fill in all required fields", type: "error" });
            return;
        }
        setIsCreating(true);
        try {
            const response = await apiClient.post<UserResponse>("/api/users", {
                name: createName.trim(),
                email: createEmail.trim(),
                password: createPassword,
                role: createRole,
            });
            if (response.success && response.data) {
                toaster.create({
                    title: "User created",
                    description: `${response.data.name} has been added.`,
                    type: "success",
                });
                setCreateDialogOpen(false);
                fetchUsers();
            } else {
                throw new Error(response.error || "Failed to create user");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to create user",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsCreating(false);
        }
    };

    // ── Edit ──────────────────────────────────────────────────────────────────
    const openEditDialog = (u: UserResponse) => {
        setUserToEdit(u);
        setEditName(u.name);
        setEditEmail(u.email);
        setEditRole(u.role as "admin" | "user");
        setEditPassword("");
        setShowEditPassword(false);
        setEditDialogOpen(true);
    };

    const handleEdit = async () => {
        if (!userToEdit) return;
        if (!editName.trim() || !editEmail.trim()) {
            toaster.create({ title: "Name and email are required", type: "error" });
            return;
        }
        setIsEditing(true);
        try {
            const payload: any = {
                name: editName.trim(),
                email: editEmail.trim(),
                role: editRole,
            };
            if (editPassword.trim()) {
                payload.password = editPassword;
            }
            const response = await apiClient.put<UserResponse>(`/api/users/${userToEdit.id}`, payload);
            if (response.success && response.data) {
                toaster.create({
                    title: "User updated",
                    description: `${response.data.name} has been updated.`,
                    type: "success",
                });
                setEditDialogOpen(false);
                setUserToEdit(null);
                fetchUsers();
            } else {
                throw new Error(response.error || "Failed to update user");
            }
        } catch (error) {
            toaster.create({
                title: "Failed to update user",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsEditing(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const openDeleteDialog = (u: UserResponse) => {
        setUserToDelete(u);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        setDeleteDialogOpen(false);
        toaster.create({ id: "deleting-user", title: "Deleting user...", type: "loading" });
        try {
            const response = await apiClient.delete(`/api/users/${userToDelete.id}`);
            if (response.success) {
                toaster.dismiss("deleting-user");
                toaster.create({
                    title: "User deleted",
                    description: `${userToDelete.name} has been removed.`,
                    type: "success",
                });
                setUsers(users.filter((u) => u.id !== userToDelete.id));
            } else {
                throw new Error(response.error || "Failed to delete user");
            }
        } catch (error) {
            toaster.dismiss("deleting-user");
            toaster.create({
                title: "Failed to delete user",
                description: error instanceof Error ? error.message : "Please try again",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
        }
    };

    const stats = [
        { label: "Total Users", value: users.length, color: "blue" },
        { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "red" },
        { label: "Salespersons", value: users.filter((u) => u.role === "user").length, color: "green" },
    ];

    if (currentUser && currentUser.role !== "admin") return null;

    return (
        <DashboardLayout>
            <VStack gap={6} align="stretch">
                {/* Header */}
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Box>
                        <Heading size={{ base: "lg", md: "xl" }} fontWeight="semibold">
                            Users
                        </Heading>
                        <Text color="gray.500" fontSize="sm">
                            Manage dashboard access and user roles
                        </Text>
                    </Box>
                    <Button colorPalette="blue" size="sm" onClick={openCreateDialog}>
                        <LuPlus />
                        <Text display={{ base: "none", sm: "inline" }}>Add User</Text>
                    </Button>
                </Flex>

                {/* Stats */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    {stats.map((stat) => (
                        <Card.Root key={stat.label} bg="white" borderWidth="1px" borderColor="gray.100">
                            <Card.Body p={4}>
                                <VStack align="flex-start" gap={1}>
                                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                                        {stat.label}
                                    </Text>
                                    <Text fontSize="2xl" fontWeight="bold" color={`${stat.color}.600`}>
                                        {stat.value}
                                    </Text>
                                </VStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </SimpleGrid>

                {/* Search */}
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                    <Card.Body p={4}>
                        <HStack flex={1}>
                            <Icon color="gray.400">
                                <LuSearch />
                            </Icon>
                            <Input
                                placeholder="Search by name, email or role..."
                                variant="flushed"
                                size="sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </HStack>
                    </Card.Body>
                </Card.Root>

                {/* Users Table */}
                <Card.Root bg="white" borderWidth="1px" borderColor="gray.100">
                    <Card.Body p={0}>
                        {isLoading ? (
                            <Box p={8} textAlign="center">
                                <Text color="gray.500">Loading users...</Text>
                            </Box>
                        ) : filteredUsers.length === 0 ? (
                            <VStack p={12} gap={3}>
                                <Icon fontSize="3xl" color="gray.300">
                                    <LuUserCog />
                                </Icon>
                                <Text color="gray.400" fontWeight="medium">
                                    {searchQuery ? "No users found" : "No users yet"}
                                </Text>
                                {!searchQuery && (
                                    <Button size="sm" colorPalette="blue" onClick={openCreateDialog}>
                                        <LuPlus /> Add first user
                                    </Button>
                                )}
                            </VStack>
                        ) : (
                            <Table.Root size="sm">
                                <Table.Header>
                                    <Table.Row bg="gray.50">
                                        <Table.ColumnHeader px={5} py={3} fontWeight="semibold" fontSize="xs" color="gray.500" textTransform="uppercase">
                                            Name
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontWeight="semibold" fontSize="xs" color="gray.500" textTransform="uppercase">
                                            Email
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontWeight="semibold" fontSize="xs" color="gray.500" textTransform="uppercase">
                                            Role
                                        </Table.ColumnHeader>
                                        <Table.ColumnHeader px={5} py={3} fontWeight="semibold" fontSize="xs" color="gray.500" textTransform="uppercase" textAlign="right">
                                            Actions
                                        </Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {filteredUsers.map((u) => (
                                        <Table.Row key={u.id} _hover={{ bg: "gray.50" }} transition="background 0.15s">
                                            <Table.Cell px={5} py={3}>
                                                <HStack gap={3}>
                                                    <Flex
                                                        w={8}
                                                        h={8}
                                                        borderRadius="full"
                                                        bg={`${getRoleColor(u.role)}.100`}
                                                        align="center"
                                                        justify="center"
                                                        flexShrink={0}
                                                    >
                                                        <Icon color={`${getRoleColor(u.role)}.600`} fontSize="sm">
                                                            {u.role === "admin" ? <LuShieldCheck /> : <LuUser />}
                                                        </Icon>
                                                    </Flex>
                                                    <VStack align="flex-start" gap={0}>
                                                        <Text fontWeight="medium" fontSize="sm">
                                                            {u.name}
                                                        </Text>
                                                        {u.id === currentUser?.id && (
                                                            <Text fontSize="xs" color="blue.500">
                                                                (you)
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                </HStack>
                                            </Table.Cell>
                                            <Table.Cell px={5} py={3}>
                                                <Text fontSize="sm" color="gray.600">
                                                    {u.email}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell px={5} py={3}>
                                                <Badge colorPalette={getRoleColor(u.role)} variant="subtle" size="sm">
                                                    {getRoleLabel(u.role)}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell px={5} py={3}>
                                                <HStack justify="flex-end" gap={1}>
                                                    <IconButton
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label="Edit user"
                                                        onClick={() => openEditDialog(u)}
                                                    >
                                                        <LuPencil />
                                                    </IconButton>
                                                    <IconButton
                                                        variant="ghost"
                                                        size="sm"
                                                        colorPalette="red"
                                                        aria-label="Delete user"
                                                        disabled={u.id === currentUser?.id}
                                                        onClick={() => openDeleteDialog(u)}
                                                    >
                                                        <LuTrash2 />
                                                    </IconButton>
                                                </HStack>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        )}
                    </Card.Body>
                </Card.Root>
            </VStack>

            {/* ── Create User Dialog ─────────────────────────────────────────── */}
            <Dialog.Root open={createDialogOpen} onOpenChange={(e) => setCreateDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="480px" borderRadius="2xl">
                            <Dialog.Header borderBottomWidth="1px" borderColor="gray.100" p={5}>
                                <HStack gap={3}>
                                    <Flex
                                        w={9}
                                        h={9}
                                        borderRadius="lg"
                                        bg="blue.50"
                                        align="center"
                                        justify="center"
                                    >
                                        <Icon color="blue.600">
                                            <LuUserCog />
                                        </Icon>
                                    </Flex>
                                    <Dialog.Title fontWeight="semibold">Add New User</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" position="absolute" top={4} right={4} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <VStack gap={4}>
                                    <Field.Root required>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Full Name
                                        </Field.Label>
                                        <Input
                                            placeholder="Enter full name"
                                            value={createName}
                                            onChange={(e) => setCreateName(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root required>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Email Address
                                        </Field.Label>
                                        <Input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={createEmail}
                                            onChange={(e) => setCreateEmail(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root required>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Password
                                        </Field.Label>
                                        <HStack w="full">
                                            <Input
                                                type={showCreatePassword ? "text" : "password"}
                                                placeholder="Enter password (min. 6 characters)"
                                                value={createPassword}
                                                onChange={(e) => setCreatePassword(e.target.value)}
                                                flex={1}
                                            />
                                            <IconButton
                                                variant="ghost"
                                                size="sm"
                                                aria-label="Toggle password visibility"
                                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                            >
                                                {showCreatePassword ? <LuEyeOff /> : <LuEye />}
                                            </IconButton>
                                        </HStack>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Role
                                        </Field.Label>
                                        <NativeSelect.Root>
                                            <NativeSelect.Field
                                                value={createRole}
                                                onChange={(e) =>
                                                    setCreateRole(e.target.value as "admin" | "user")
                                                }
                                            >
                                                <option value="user">Salesperson</option>
                                                <option value="admin">Admin</option>
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                        <Field.HelperText fontSize="xs" color="gray.400">
                                            Sales users can create invoices and manage inventory.
                                        </Field.HelperText>
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer borderTopWidth="1px" borderColor="gray.100" p={5} gap={3}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCreateDialogOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    onClick={handleCreate}
                                    loading={isCreating}
                                    loadingText="Creating..."
                                >
                                    Create User
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── Edit User Dialog ───────────────────────────────────────────── */}
            <Dialog.Root open={editDialogOpen} onOpenChange={(e) => setEditDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="480px" borderRadius="2xl">
                            <Dialog.Header borderBottomWidth="1px" borderColor="gray.100" p={5}>
                                <HStack gap={3}>
                                    <Flex
                                        w={9}
                                        h={9}
                                        borderRadius="lg"
                                        bg="orange.50"
                                        align="center"
                                        justify="center"
                                    >
                                        <Icon color="orange.600">
                                            <LuPencil />
                                        </Icon>
                                    </Flex>
                                    <Dialog.Title fontWeight="semibold">Edit User</Dialog.Title>
                                </HStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" position="absolute" top={4} right={4} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <VStack gap={4}>
                                    <Field.Root required>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Full Name
                                        </Field.Label>
                                        <Input
                                            placeholder="Enter full name"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root required>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Email Address
                                        </Field.Label>
                                        <Input
                                            type="email"
                                            placeholder="Enter email address"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                        />
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            Role
                                        </Field.Label>
                                        <NativeSelect.Root>
                                            <NativeSelect.Field
                                                value={editRole}
                                                onChange={(e) =>
                                                    setEditRole(e.target.value as "admin" | "user")
                                                }
                                            >
                                                <option value="user">Salesperson</option>
                                                <option value="admin">Admin</option>
                                            </NativeSelect.Field>
                                            <NativeSelect.Indicator />
                                        </NativeSelect.Root>
                                    </Field.Root>
                                    <Field.Root>
                                        <Field.Label fontSize="sm" fontWeight="medium">
                                            New Password{" "}
                                            <Text as="span" color="gray.400" fontWeight="normal">
                                                (leave blank to keep current)
                                            </Text>
                                        </Field.Label>
                                        <HStack w="full">
                                            <Input
                                                type={showEditPassword ? "text" : "password"}
                                                placeholder="Enter new password"
                                                value={editPassword}
                                                onChange={(e) => setEditPassword(e.target.value)}
                                                flex={1}
                                            />
                                            <IconButton
                                                variant="ghost"
                                                size="sm"
                                                aria-label="Toggle password visibility"
                                                onClick={() => setShowEditPassword(!showEditPassword)}
                                            >
                                                {showEditPassword ? <LuEyeOff /> : <LuEye />}
                                            </IconButton>
                                        </HStack>
                                    </Field.Root>
                                </VStack>
                            </Dialog.Body>
                            <Dialog.Footer borderTopWidth="1px" borderColor="gray.100" p={5} gap={3}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditDialogOpen(false)}
                                    disabled={isEditing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    size="sm"
                                    onClick={handleEdit}
                                    loading={isEditing}
                                    loadingText="Saving..."
                                >
                                    Save Changes
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
            <Dialog.Root open={deleteDialogOpen} onOpenChange={(e) => setDeleteDialogOpen(e.open)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="400px" borderRadius="2xl">
                            <Dialog.Header borderBottomWidth="1px" borderColor="gray.100" p={5}>
                                <Dialog.Title fontWeight="semibold" color="red.600">
                                    Delete User
                                </Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" position="absolute" top={4} right={4} />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body p={5}>
                                <Text color="gray.600" fontSize="sm">
                                    Are you sure you want to delete{" "}
                                    <Text as="span" fontWeight="semibold" color="gray.800">
                                        {userToDelete?.name}
                                    </Text>
                                    ? This action cannot be undone and the user will lose all access to
                                    the dashboard.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer borderTopWidth="1px" borderColor="gray.100" p={5} gap={3}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteDialogOpen(false)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorPalette="red"
                                    size="sm"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                    loadingText="Deleting..."
                                >
                                    Delete User
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </DashboardLayout>
    );
}
