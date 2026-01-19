"use client";

import { Card, Heading, Textarea } from "@chakra-ui/react";

interface NotesSectionProps {
    notes: string;
    onNotesChange: (value: string) => void;
}

export default function NotesSection({
    notes,
    onNotesChange,
}: NotesSectionProps) {
    return (
        <Card.Root border="1px solid" borderColor="gray.100" bg="white">
            <Card.Header p={5} pb={0}>
                <Heading size="sm" fontWeight="semibold">Notes</Heading>
            </Card.Header>
            <Card.Body p={5}>
                <Textarea
                    placeholder="Add any notes or payment instructions..."
                    size="sm"
                    rows={3}
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                />
            </Card.Body>
        </Card.Root>
    );
}

