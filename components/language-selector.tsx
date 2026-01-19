"use client";

import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-black border-black/20 dark:border-white/20">
                <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
                {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
