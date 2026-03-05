"use client";

import { useState } from 'react';
import { Button, Menu, Portal, HStack, Icon, Text, Badge } from '@chakra-ui/react';
import { LuScanLine, LuCamera, LuKeyboard } from 'react-icons/lu';
import { BarcodeScanner } from './BarcodeScanner';
import { PhysicalScannerInput } from './PhysicalScannerInput';

export type ScannerMode = 'camera' | 'physical' | 'auto';

interface ScannerButtonProps {
    onScan: (value: string) => void;
    disabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'solid' | 'outline' | 'ghost';
}

export function ScannerButton({ 
    onScan, 
    disabled = false,
    size = 'sm',
    variant = 'outline',
}: ScannerButtonProps) {
    const [scannerMode, setScannerMode] = useState<ScannerMode>('auto');
    const [cameraScannerOpen, setCameraScannerOpen] = useState(false);
    const [physicalScannerEnabled, setPhysicalScannerEnabled] = useState(false);

    const handleModeSelect = (mode: ScannerMode) => {
        setScannerMode(mode);
        
        if (mode === 'camera') {
            setCameraScannerOpen(true);
            setPhysicalScannerEnabled(false);
        } else if (mode === 'physical') {
            setPhysicalScannerEnabled(true);
            setCameraScannerOpen(false);
        } else {
            // Auto mode: enable physical scanner by default
            setPhysicalScannerEnabled(true);
            setCameraScannerOpen(false);
        }
    };

    const handleCameraScan = (value: string) => {
        onScan(value);
        setCameraScannerOpen(false);
    };

    const handlePhysicalScan = (value: string) => {
        onScan(value);
    };

    return (
        <>
            <Menu.Root positioning={{ placement: 'bottom-start' }}>
                <Menu.Trigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        disabled={disabled}
                        colorPalette="blue"
                        title="Scan barcode"
                    >
                        <Icon><LuScanLine /></Icon>
                    </Button>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="200px" bg="bg.surface" borderRadius="xl" border="1px solid" borderColor="border.default">
                            <Menu.Item
                                value="camera"
                                onClick={() => handleModeSelect('camera')}
                                borderRadius="lg"
                            >
                                <HStack gap={2}>
                                    <Icon><LuCamera /></Icon>
                                    <Text flex={1}>Camera Scanner</Text>
                                </HStack>
                            </Menu.Item>
                            <Menu.Item
                                value="physical"
                                onClick={() => handleModeSelect('physical')}
                                borderRadius="lg"
                            >
                                <HStack gap={2}>
                                    <Icon><LuKeyboard /></Icon>
                                    <Text flex={1}>Physical Scanner</Text>
                                </HStack>
                            </Menu.Item>
                            <Menu.Item
                                value="auto"
                                onClick={() => handleModeSelect('auto')}
                                borderRadius="lg"
                            >
                                <HStack gap={2}>
                                    <Icon><LuScanLine /></Icon>
                                    <Text flex={1}>Auto-detect</Text>
                                    {scannerMode === 'auto' && (
                                        <Badge colorPalette="blue" size="sm">Active</Badge>
                                    )}
                                </HStack>
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            {/* Camera Scanner Dialog */}
            <BarcodeScanner
                isOpen={cameraScannerOpen}
                onClose={() => setCameraScannerOpen(false)}
                onScan={handleCameraScan}
            />

            {/* Physical Scanner Input */}
            <PhysicalScannerInput
                onScan={handlePhysicalScan}
                enabled={physicalScannerEnabled}
                showIndicator={physicalScannerEnabled}
            />
        </>
    );
}
