"use client";

import { useEffect, useRef } from 'react';
import {
    Dialog,
    Portal,
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Icon,
    Spinner,
    Badge,
} from '@chakra-ui/react';
import { LuX, LuScanLine, LuTriangleAlert } from 'react-icons/lu';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';

interface BarcodeScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (value: string) => void;
    onError?: (error: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan, onError }: BarcodeScannerProps) {
    const scannerIdRef = useRef<string>(`barcode-scanner-${Date.now()}`);
    const { isScanning, error, startScanning, stopScanning } = useBarcodeScanner({
        onScan: (value) => {
            onScan(value);
            onClose();
        },
        onError,
    });

    useEffect(() => {
        if (isOpen && !isScanning) {
            // Small delay to ensure dialog is rendered
            const timer = setTimeout(() => {
                startScanning(scannerIdRef.current);
            }, 100);

            return () => {
                clearTimeout(timer);
                if (isScanning) {
                    stopScanning();
                }
            };
        }

        return () => {
            if (isScanning) {
                stopScanning();
            }
        };
    }, [isOpen, isScanning, startScanning, stopScanning]);

    const handleClose = async () => {
        await stopScanning();
        onClose();
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.800" />
                <Dialog.Positioner>
                    <Dialog.Content
                        bg="black"
                        maxW="600px"
                        w="90vw"
                        borderRadius="xl"
                        p={0}
                        overflow="hidden"
                    >
                        <Dialog.Header
                            bg="blackAlpha.900"
                            borderBottomWidth="1px"
                            borderColor="gray.700"
                            p={4}
                        >
                            <HStack justify="space-between" align="center">
                                <HStack gap={2}>
                                    <Icon color="white"><LuScanLine /></Icon>
                                    <Dialog.Title color="white" fontWeight="semibold">
                                        Scan Barcode
                                    </Dialog.Title>
                                </HStack>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.200' }}
                                >
                                    <LuX />
                                </Button>
                            </HStack>
                        </Dialog.Header>

                        <Dialog.Body p={0} position="relative">
                            {error ? (
                                <VStack p={8} gap={4} align="center" minH="400px" justify="center">
                                    <Icon fontSize="4xl" color="red.400">
                                        <LuTriangleAlert />
                                    </Icon>
                                    <VStack gap={2} align="center">
                                        <Text color="white" fontWeight="medium" fontSize="lg">
                                            Camera Error
                                        </Text>
                                        <Text color="gray.300" fontSize="sm" textAlign="center" maxW="400px">
                                            {error}
                                        </Text>
                                    </VStack>
                                    <Button onClick={handleClose} colorPalette="blue">
                                        Close
                                    </Button>
                                </VStack>
                            ) : (
                                <Box position="relative" w="100%" minH="400px">
                                    <Box
                                        id={scannerIdRef.current}
                                        w="100%"
                                        minH="400px"
                                    />
                                    {isScanning && (
                                        <Box
                                            position="absolute"
                                            top="50%"
                                            left="50%"
                                            transform="translate(-50%, -50%)"
                                            pointerEvents="none"
                                        >
                                            <VStack gap={2} align="center">
                                                <Box
                                                    w="250px"
                                                    h="250px"
                                                    borderWidth="2px"
                                                    borderColor="blue.400"
                                                    borderRadius="lg"
                                                    borderStyle="dashed"
                                                />
                                                <Badge colorPalette="blue" variant="solid" px={3} py={1}>
                                                    <HStack gap={2}>
                                                        <Spinner size="xs" />
                                                        <Text fontSize="xs">Scanning...</Text>
                                                    </HStack>
                                                </Badge>
                                            </VStack>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Dialog.Body>

                        <Dialog.Footer
                            bg="blackAlpha.900"
                            borderTopWidth="1px"
                            borderColor="gray.700"
                            p={4}
                        >
                            <HStack justify="space-between" w="100%">
                                <Text color="gray.400" fontSize="xs">
                                    Position the barcode within the frame
                                </Text>
                                <Button onClick={handleClose} variant="outline" color="white" borderColor="gray.600">
                                    Cancel
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
