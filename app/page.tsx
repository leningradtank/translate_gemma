"use client";

import React, { useState } from "react";
import { SpeechInput } from "@/components/speech-input";
import { LanguageSelector } from "@/components/language-selector";
import { RegionSelector } from "@/components/region-selector";
import { translateText } from "@/lib/ollama";
import { REGIONS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { ArrowRight, Volume2, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [phoneticText, setPhoneticText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [selectedRegion, setSelectedRegion] = useState("world");
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const { speak, stop, isSpeaking } = useTextToSpeech();

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    const region = REGIONS.find((r) => r.id === regionId);
    if (region && region.languageCode) {
      setTargetLanguage(region.languageCode);
      toast.info(`Language set to ${region.languageCode}`);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
  };

  const handleTranscript = async (text: string) => {
    setSourceText(text);
    if (!text) return;

    // Stop any ongoing speech when new input arrives
    stop();

    setIsTranslating(true);
    setTranslatedText("");
    setPhoneticText("");

    const result = await translateText(text, targetLanguage);

    if (result.error) {
      toast.error(result.error);
    } else {
      setTranslatedText(result.translatedText);
      setPhoneticText(result.phonetic || "");

      // Auto-speak logic
      if (autoSpeak) {
        speak(result.translatedText, targetLanguage);
      }
    }

    setIsTranslating(false);
  };

  const handleManualSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(translatedText, targetLanguage);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-black text-black dark:text-white selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-500">
      <div className="max-w-3xl w-full space-y-12">
        <header className="flex flex-col items-center space-y-2 text-center fade-in slide-in-from-top-4 duration-700 animate-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/10 text-xs font-medium uppercase tracking-wider">
            <span>Powered by Translategemma</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Voice Translator
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Speak in English, listen to the world.
          </p>
        </header>

        <section className="flex flex-col items-center space-y-8 fade-in slide-in-from-bottom-8 duration-700 delay-100 animate-in fill-mode-forwards">

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center md:text-left">Destination</span>
              <RegionSelector
                value={selectedRegion}
                onChange={handleRegionChange}
                disabled={isTranslating}
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-black/10 dark:bg-white/10" />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center md:text-left">Language</span>
              <LanguageSelector
                value={targetLanguage}
                onChange={handleLanguageChange}
                disabled={isTranslating}
              />
            </div>
          </div>

          <div className="p-8">
            <SpeechInput
              onTranscript={handleTranscript}
              isTranslating={isTranslating}
            />
          </div>

        </section>

        {(sourceText || isTranslating || translatedText) && (
          <div className="grid md:grid-cols-[1fr,auto,1fr] gap-6 items-start fade-in slide-in-from-bottom-4 duration-500 animate-in">

            {/* Source Text Card */}
            <Card className="p-6 min-h-[160px] flex flex-col gap-2 border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-sm shadow-none">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">English</span>
              <p className="text-xl font-medium leading-relaxed">{sourceText}</p>
            </Card>

            <div className="hidden md:flex items-center justify-center h-full pt-12 text-muted-foreground">
              <ArrowRight className="w-6 h-6" />
            </div>

            {/* Translated Text Card */}
            <Card className={cn("p-6 min-h-[160px] flex flex-col gap-2 border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.05] shadow-none transition-all duration-500 relative group", isTranslating ? "opacity-70" : "opacity-100")}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{targetLanguage}</span>
                {isTranslating && <span className="animate-pulse w-2 h-2 rounded-full bg-current" />}
              </div>

              {isTranslating && !translatedText ? (
                <div className="space-y-3 mt-2">
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="text-xl font-medium leading-relaxed animate-in fade-in duration-500">{translatedText}</p>
                  {phoneticText && (
                    <p className="text-sm font-medium italic text-muted-foreground animate-in fade-in duration-700">
                      {phoneticText}
                    </p>
                  )}
                </div>
              )}

              {!isTranslating && translatedText && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleManualSpeak}
                    className="h-8 w-8 text-muted-foreground hover:text-black dark:hover:text-white"
                  >
                    {isSpeaking ? <StopCircle className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </Card>

          </div>
        )}

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-center gap-3 fade-in slide-in-from-bottom-4 duration-700 animate-in delay-200">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.05]">
            <Switch
              id="auto-speak"
              checked={autoSpeak}
              onCheckedChange={setAutoSpeak}
              className="data-[state=checked]:bg-black dark:data-[state=checked]:bg-white"
            />
            <Label htmlFor="auto-speak" className="text-sm font-medium cursor-pointer">
              Auto-Speak Translation
            </Label>
          </div>
        </div>

      </div>
    </main>
  );
}
