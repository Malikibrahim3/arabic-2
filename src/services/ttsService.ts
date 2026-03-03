const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

export class TTSService {
    static async playText(text: string, dialect: string = 'msa'): Promise<void> {
        if (!GOOGLE_API_KEY) {
            console.warn("TTS Service: No Google API Key available.");
            return;
        }

        const voiceName = dialect === 'egyptian' ? 'ar-EG-Wavenet-B' : 'ar-XA-Wavenet-B';
        const languageCode = dialect === 'egyptian' ? 'ar-EG' : 'ar-SA';

        try {
            const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GOOGLE_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode, name: voiceName },
                    audioConfig: { audioEncoding: 'MP3' }
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API Error: ${response.status}`);
            }

            const data = await response.json();
            if (data.audioContent) {
                const audioSrc = `data:audio/mp3;base64,${data.audioContent}`;
                const audio = new Audio(audioSrc);
                await audio.play();
            }
        } catch (e) {
            console.error("Failed to play TTS:", e);
        }
    }
}
