"use client";

import { useState, useEffect, useCallback } from "react";
import { LANGUAGES } from "@/lib/constants";

export function useTextToSpeech() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateVoices = () => {
            setVoices(window.speechSynthesis.getVoices());
        };

        updateVoices();
        window.speechSynthesis.onvoiceschanged = updateVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = useCallback((text: string, languageName: string) => {
        if (!text || typeof window === "undefined") return;

        // Find the language object to get the voiceCode
        const langObj = LANGUAGES.find(l => l.label === languageName);

        // Default to 'en-US' if not found
        const targetLangCode = langObj?.voiceCode || 'en-US';

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Robust voice selection strategy:
        // 1. Precise match (e.g., 'es-ES' === 'es-ES')
        // 2. Loose match (e.g., 'es-MX' starts with 'es')
        // 3. Fallback to first available voice

        const voice =
            voices.find(v => v.lang === targetLangCode) ||
            voices.find(v => v.lang.startsWith(targetLangCode.split('-')[0])) ||
            voices.find(v => v.name.includes(languageName)); // Fallback to name check

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang; // Important to set lang explicitly
        } else {
            // Even if no specific voice is found, setting the lang property helps the browser 
            // try to synthesize it with a default voice for that language
            utterance.lang = targetLangCode;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("Speech error:", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [voices]);

    const stop = useCallback(() => {
        if (typeof window !== "undefined") {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return { speak, stop, isSpeaking };
}
