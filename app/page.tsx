"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, VStack, Heading, Text, Spinner } from "@chakra-ui/react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("bms_user");
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="bg.subtle"
    >
      <VStack gap={4}>
        <Spinner size="xl" color="blue.500" borderWidth="4px" />
        <Heading size="md" color="gray.600">
          Loading BMS...
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Business Management System
        </Text>
      </VStack>
    </Box>
  );
}
