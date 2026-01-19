export interface TranslationResponse {
  translatedText: string;
  phonetic?: string;
  error?: string;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<TranslationResponse> {
  try {
    // Prompt strategy: Request translation and phonetic verification on separate lines
    // Explicitly ask for romanization of the TRANSLATED text to avoid it transcribing the English source.
    const prompt = `Task: Translate the following text to ${targetLanguage}.

Instructions:
1. Provide the translation in the target language.
2. ON A NEW LINE, provide the Romanized pronunciation (transliteration) OF THE TRANSLATION you just generated.
3. Do not include strict English translation words in the pronunciation.
4. Output STRICTLY in two lines.

Text to translate: "${text}"`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "translategemma:latest",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.response.trim();

    // Parse the response
    const lines = rawText.split('\n').filter((line: string) => line.trim().length > 0);

    let translatedText = "";
    let phonetic = "";

    if (lines.length >= 2) {
      translatedText = lines[0].trim();
      phonetic = lines[1].trim();
    } else {
      translatedText = rawText; // Fallback if model doesn't follow instructions perfectly
    }

    return { translatedText, phonetic };
  } catch (error) {
    console.error("Translation error:", error);
    return {
      translatedText: "",
      error: error instanceof Error ? error.message : "Failed to translate"
    };
  }
}
