"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";

interface RegionSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function RegionSelector({ value, onChange, disabled }: RegionSelectorProps) {
    const selectedRegion = REGIONS.find((r) => r.id === value);

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-black border-black/20 dark:border-white/20">
                <SelectValue placeholder="Select destination">
                    {selectedRegion && selectedRegion.id !== 'world' ? (
                        <div className="flex items-center gap-2">
                            <span>{selectedRegion.flag}</span>
                            <span>{selectedRegion.name}</span>
                        </div>
                    ) : (
                        "Select Destination"
                    )}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                {REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg leading-none">{region.flag}</span>
                            <span>{region.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
