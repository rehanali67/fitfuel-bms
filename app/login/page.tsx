"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    Field,
    Heading,
    Input,
    Stack,
    Text,
    VStack,
    HStack,
    Icon,
} from "@chakra-ui/react";
import { useAuth } from "@/context/AuthContext";
import { LuBuilding2, LuMail, LuLock, LuArrowRight } from "react-icons/lu";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push("/dashboard");
        } else {
            setError(result.error || "Login failed");
        }
        setIsLoading(false);
    };

    return (
        <Box
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="bg.subtle"
            p={4}
        >
            <Box
                display="flex"
                flexDirection={{ base: "column", lg: "row" }}
                maxW="1200px"
                w="full"
                overflow="hidden"
                borderRadius="2xl"
                boxShadow="2xl"
            >

                <Box
                    flex="1"
                    bg="blue.600"
                    p={{ base: 8, md: 12 }}
                    display={{ base: "none", lg: "flex" }}
                    flexDirection="column"
                    justifyContent="center"
                    position="relative"
                    overflow="hidden"
                >
                    <Box
                        position="absolute"
                        top="-20%"
                        right="-20%"
                        w="60%"
                        h="60%"
                        bg="blue.500"
                        borderRadius="full"
                        opacity={0.3}
                    />
                    <Box
                        position="absolute"
                        bottom="-10%"
                        left="-10%"
                        w="40%"
                        h="40%"
                        bg="blue.700"
                        borderRadius="full"
                        opacity={0.3}
                    />

                    <VStack align="flex-start" gap={6} position="relative" zIndex={1}>
                        <HStack gap={3}>
                            <Icon fontSize="4xl" color="white">
                                <LuBuilding2 />
                            </Icon>
                            <Heading size="2xl" color="white" fontWeight="bold">
                                BMS
                            </Heading>
                        </HStack>

                        <Heading size="xl" color="white" fontWeight="medium">
                            Business Management System
                        </Heading>

                        <Text color="whiteAlpha.800" fontSize="lg" maxW="md">
                            Streamline your business operations with our comprehensive management solution.
                            Generate invoices, create quotations, and manage your inventory all in one place.
                        </Text>

                        <VStack align="flex-start" gap={3} mt={6}>
                            <HStack gap={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="md">
                                    <Text color="white">📄</Text>
                                </Box>
                                <Text color="white">Invoice Generation</Text>
                            </HStack>
                            <HStack gap={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="md">
                                    <Text color="white">📝</Text>
                                </Box>
                                <Text color="white">Quotation Management</Text>
                            </HStack>
                            <HStack gap={3}>
                                <Box bg="whiteAlpha.200" p={2} borderRadius="md">
                                    <Text color="white">📦</Text>
                                </Box>
                                <Text color="white">Inventory Control</Text>
                            </HStack>
                        </VStack>
                    </VStack>
                </Box>

                {/* Right Side - Login Form */}
                <Box
                    flex="1"
                    bg="bg"
                    p={{ base: 6, md: 12 }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Card.Root w="full" maxW="400px" variant="outline" border="none" shadow="none">
                        <Card.Header textAlign="center" pb={2}>
                            <HStack justify="center" gap={2} mb={4} display={{ base: "flex", lg: "none" }}>
                                <Icon fontSize="2xl" color="blue.500">
                                    <LuBuilding2 />
                                </Icon>
                                <Heading size="xl" color="blue.500">BMS</Heading>
                            </HStack>
                            <Card.Title fontSize="2xl">Welcome Back</Card.Title>
                            <Card.Description mt={2}>
                                Sign in to access your dashboard
                            </Card.Description>
                        </Card.Header>

                        <Card.Body>
                            <form onSubmit={handleSubmit}>
                                <Stack gap={5}>
                                    {error && (
                                        <Box
                                            bg="red.500/10"
                                            color="red.600"
                                            p={3}
                                            borderRadius="md"
                                            fontSize="sm"
                                            borderWidth="1px"
                                            borderColor="red.200"
                                        >
                                            {error}
                                        </Box>
                                    )}

                                    <Field.Root>
                                        <Field.Label>Email Address</Field.Label>
                                        <Box position="relative">
                                            <Box
                                                position="absolute"
                                                left={3}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                color="fg.subtle"
                                                zIndex={2}
                                            >
                                                <LuMail />
                                            </Box>
                                            <Input
                                                type="email"
                                                placeholder="admin@bms.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                pl={10}
                                                size="lg"
                                                required
                                            />
                                        </Box>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Password</Field.Label>
                                        <Box position="relative">
                                            <Box
                                                position="absolute"
                                                left={3}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                color="fg.subtle"
                                                zIndex={2}
                                            >
                                                <LuLock />
                                            </Box>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                pl={10}
                                                size="lg"
                                                required
                                            />
                                        </Box>
                                    </Field.Root>

                                    <Button
                                        type="submit"
                                        colorPalette="blue"
                                        size="lg"
                                        w="full"
                                        loading={isLoading}
                                        loadingText="Signing in..."
                                        mt={2}
                                    >
                                        Sign In
                                        <LuArrowRight />
                                    </Button>
                                </Stack>
                            </form>
                        </Card.Body>


                    </Card.Root>
                </Box>
            </Box>
        </Box>
    );
}
