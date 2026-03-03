import { useState, useCallback, useRef } from 'react';

// Type declarations for Web Speech API
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
    error: string;
    message: string;
}

interface SpeechRecognitionInstance {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    }
}

export type SpeechLang = 'ar-EG' | 'ar-SA' | 'ar';

interface UseSpeechRecognitionReturn {
    isSupported: boolean;
    isListening: boolean;
    isProcessing: boolean;
    transcript: string;
    confidence: number;
    error: string | null;
    isHighAccuracy: boolean;
    startListening: (lang?: SpeechLang, expectedText?: string) => void;
    stopListening: () => void;
    reset: () => void;
}

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

// ─── Silence detection config ─────────────────────────────
const SILENCE_THRESHOLD = 15;       // RMS below this = silence (0-255 scale)
const SILENCE_DURATION_MS = 1500;   // Stop after this many ms of silence
const MIN_RECORD_MS = 800;          // Minimum recording time before auto-stop
const MAX_RECORD_MS = 10000;        // Maximum recording time (safety cap)

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const analyserFrameRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordStartRef = useRef<number>(0);
    const stoppingRef = useRef(false);

    // Keep track of parameters during the recording session
    const currentLangRef = useRef<SpeechLang>('ar-SA');
    const expectedTextRef = useRef<string | undefined>(undefined);

    const SpeechRecognitionAPI =
        typeof window !== 'undefined'
            ? window.SpeechRecognition || window.webkitSpeechRecognition
            : null;

    // We support STT if either the browser API or Google Cloud key is available
    const isSupported = !!SpeechRecognitionAPI || !!GOOGLE_API_KEY;
    const isHighAccuracy = !!GOOGLE_API_KEY;

    /**
     * Call Google Cloud Speech-to-Text API
     */
    const callGoogleSTT = async (audioBlob: Blob, lang: SpeechLang, expectedText?: string) => {
        if (!GOOGLE_API_KEY) return null;

        try {
            // Convert Blob to Base64
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve) => {
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    resolve(base64String);
                };
            });
            reader.readAsDataURL(audioBlob);
            const base64Audio = await base64Promise;

            // Prepare STT config
            const config: any = {
                encoding: 'WEBM_OPUS',
                sampleRateHertz: 48000,
                languageCode: lang === 'ar-EG' ? 'ar-EG' : 'ar-SA',
                model: 'default',
                useEnhanced: true,
            };

            // Inject speech contexts if expect text is provided
            // This massively boosts accuracy for short sounds / isolated letters
            if (expectedText) {
                config.speechContexts = [{
                    phrases: [expectedText],
                    boost: 15.0
                }];
            }

            const response = await fetch(
                `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        config,
                        audio: {
                            content: base64Audio,
                        },
                    }),
                }
            );

            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const bestAlternative = data.results[0].alternatives[0];
                return {
                    transcript: bestAlternative.transcript,
                    confidence: bestAlternative.confidence || 0.9,
                };
            }
            return null;
        } catch (err) {
            console.error('Google STT Error:', err);
            return null;
        }
    };

    /**
     * Clean up silence detection resources
     */
    const cleanupSilenceDetection = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (analyserFrameRef.current) {
            cancelAnimationFrame(analyserFrameRef.current);
            analyserFrameRef.current = 0;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try { audioContextRef.current.close(); } catch (_) { /* ignore */ }
            audioContextRef.current = null;
        }
    };

    /**
     * Internal stop — called by silence detection or manual stop
     */
    const doStop = useCallback(() => {
        if (stoppingRef.current) return;
        stoppingRef.current = true;

        cleanupSilenceDetection();

        // Stop browser STT
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (_) { /* ignore */ }
        }

        // Stop MediaRecorder (triggers onstop → sends to Google STT)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (_) { /* ignore */ }
        }
    }, []);

    const startListening = useCallback(async (lang: SpeechLang = 'ar-SA', expectedText?: string) => {
        setError(null);
        setTranscript('');
        setConfidence(0);
        setIsProcessing(false);
        stoppingRef.current = false;
        currentLangRef.current = lang;
        expectedTextRef.current = expectedText;

        // ─── 1. Browser Native STT (for interim live feedback) ───
        if (SpeechRecognitionAPI) {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
            }

            const recognition = new SpeechRecognitionAPI();
            recognition.lang = lang;
            recognition.interimResults = true;
            recognition.continuous = false;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    interim += event.results[i][0].transcript;
                }
                if (interim) {
                    setTranscript(interim);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    console.warn('Browser STT Error:', event.error);
                }
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (err) {
                console.warn('Failed to start Browser STT:', err);
            }
        }

        // ─── 2. MediaRecorder + Silence Detection ────────────────
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            recordStartRef.current = Date.now();

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setIsListening(false);
                setIsProcessing(true);

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });

                if (GOOGLE_API_KEY) {
                    const result = await callGoogleSTT(
                        audioBlob,
                        currentLangRef.current,
                        expectedTextRef.current
                    );
                    if (result) {
                        setTranscript(result.transcript);
                        setConfidence(result.confidence);
                    }
                }

                setIsProcessing(false);
                // Release microphone
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);

            // ─── 3. Silence Detection via Web Audio ──────────────
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.3;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.fftSize);
            let silenceStart: number | null = null;
            let hasDetectedSpeech = false;

            const checkSilence = () => {
                if (stoppingRef.current) return;

                analyser.getByteTimeDomainData(dataArray);

                // Calculate RMS (root mean square) of the audio signal
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    const val = (dataArray[i] - 128) / 128;
                    sum += val * val;
                }
                const rms = Math.sqrt(sum / dataArray.length) * 255;

                const now = Date.now();
                const elapsed = now - recordStartRef.current;

                if (rms > SILENCE_THRESHOLD) {
                    // Sound detected — reset silence timer
                    silenceStart = null;
                    hasDetectedSpeech = true;
                } else if (hasDetectedSpeech && elapsed >= MIN_RECORD_MS) {
                    // Silence detected after speech
                    if (!silenceStart) {
                        silenceStart = now;
                    } else if (now - silenceStart >= SILENCE_DURATION_MS) {
                        // Enough silence → auto-stop
                        doStop();
                        return;
                    }
                }

                // Safety: max recording time
                if (elapsed >= MAX_RECORD_MS) {
                    doStop();
                    return;
                }

                analyserFrameRef.current = requestAnimationFrame(checkSilence);
            };

            analyserFrameRef.current = requestAnimationFrame(checkSilence);

        } catch (err) {
            setError('Microphone access denied or not available.');
            setIsListening(false);
            setIsProcessing(false);
        }
    }, [SpeechRecognitionAPI, doStop]);

    const stopListening = useCallback(() => {
        doStop();
    }, [doStop]);

    const reset = useCallback(() => {
        stoppingRef.current = true;
        cleanupSilenceDetection();
        setTranscript('');
        setConfidence(0);
        setError(null);
        setIsProcessing(false);

        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch (_) { /* ignore */ }
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try { mediaRecorderRef.current.stop(); } catch (_) { /* ignore */ }
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        setIsListening(false);
    }, []);

    return {
        isSupported,
        isListening,
        isProcessing,
        transcript,
        confidence,
        error,
        isHighAccuracy,
        startListening,
        stopListening,
        reset,
    };
}
