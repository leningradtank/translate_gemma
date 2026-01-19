"use client";

import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SpeechInputProps {
    onTranscript: (text: string) => void;
    isTranslating?: boolean;
}

export function SpeechInput({ onTranscript, isTranslating }: SpeechInputProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onstart = () => {
                    setIsListening(true);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    onTranscript(transcript);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'not-allowed') {
                        toast.error("Microphone access denied. Please allow microphone access.");
                    } else {
                        toast.error("Error recognizing speech. Please try again.");
                    }
                    setIsListening(false);
                };
            } else {
                toast.error("Browser does not support speech recognition.");
            }
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className={cn("relative flex items-center justify-center rounded-full p-1 transition-all duration-300", isListening ? "bg-black/5 scale-110" : "")}>
                {isListening && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-black/10 dark:bg-white/10" />
                )}
                <Button
                    variant={isListening ? "default" : "outline"}
                    size="lg"
                    className={cn(
                        "h-24 w-24 rounded-full border-2 transition-all duration-300",
                        isListening
                            ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white hover:bg-black/90 dark:hover:bg-white/90"
                            : "border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white bg-transparent text-black dark:text-white"
                    )}
                    onClick={toggleListening}
                    disabled={isTranslating}
                >
                    {isTranslating ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                    ) : isListening ? (
                        <Mic className="h-10 w-10 animate-pulse" />
                    ) : (
                        <Mic className="h-10 w-10" />
                    )}
                </Button>
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-2">
                {isTranslating ? "Translating..." : isListening ? "Listening..." : "Tap to speak"}
            </p>
        </div>
    );
}
