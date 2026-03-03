import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useDialect } from '../../context/DialectContext';
import { LLMService } from '../../services/llmService';
import { TTSService } from '../../services/ttsService';
import { grammarTracker } from '../../data/grammarTracker';
import { useAudio } from '../../hooks/useAudio';
import type { Exercise } from '../../data/types';
import { Mic, MicOff, CheckCircle, Bot } from 'lucide-react';
import './ConversationExercise.css';

interface Message {
    id: string;
    role: 'user' | 'model';
    arabic: string;
    english?: string;
    correction?: string | null;
}

export const ConversationExercise: React.FC<{
    exercise: Exercise;
    onComplete: () => void;
}> = ({ exercise, onComplete }) => {
    const { currentDialect } = useDialect();
    const dialectName = currentDialect === 'egyptian' ? 'egyptian' : 'msa';

    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [turnCount, setTurnCount] = useState(0);
    const maxTurns = 5;

    const {
        isSupported,
        isListening,
        transcript,
        startListening,
        stopListening,
        reset,
    } = useSpeechRecognition();

    const { playCorrectSound } = useAudio();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevListeningRef = useRef(false);

    useEffect(() => {
        if (messages.length === 0 && !isGenerating) {
            kickoffConversation();
        }
    }, [exercise.id]);

    const kickoffConversation = async () => {
        setIsGenerating(true);
        const reply = await LLMService.generateRoleplayReply(
            [{ role: 'user', content: 'hello' }],
            exercise.prompt,
            dialectName
        );

        setIsGenerating(false);
        setMessages([{
            id: Date.now().toString(),
            role: 'model',
            arabic: reply.replyArabic,
            english: reply.replyEnglish,
            correction: reply.correction || null
        }]);

        TTSService.playText(reply.replyArabic, dialectName);
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGenerating, transcript]);

    useEffect(() => {
        if (prevListeningRef.current && !isListening && transcript) {
            handleUserMessage(transcript);
            reset();
        }
        prevListeningRef.current = isListening;
    }, [isListening, transcript]);

    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            arabic: text
        };

        const newHistory = [...messages, newUserMsg];
        setMessages(newHistory);
        setTurnCount(c => c + 1);

        if (turnCount + 1 >= maxTurns) {
            playCorrectSound();
            setTimeout(onComplete, 1500);
            return;
        }

        setIsGenerating(true);

        const llmHistory = newHistory.map(m => ({
            role: m.role,
            content: m.arabic
        }));

        const reply = await LLMService.generateRoleplayReply(
            llmHistory,
            exercise.prompt,
            dialectName
        );

        setIsGenerating(false);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            arabic: reply.replyArabic,
            english: reply.replyEnglish,
            correction: reply.correction || null
        }]);

        if (reply.correction) {
            grammarTracker.recordFromCorrection(reply.correction, text);
        }

        TTSService.playText(reply.replyArabic, dialectName);
    };

    if (!isSupported) {
        return (
            <div className="conv-unsupported">
                <p>⚠️ Speech recognition is not supported in this browser.</p>
                <p>Please use Google Chrome for interactive conversations.</p>
            </div>
        );
    }

    return (
        <div className="chat-interface">
            <div className="chat-header">
                <div className="chat-header-info">
                    <div className="avatar-header">
                        <Bot size={24} color="#FFF" />
                    </div>
                    <div className="chat-title">
                        <h2>{exercise.prompt}</h2>
                        <span>Roleplay • Turn {Math.min(turnCount + 1, maxTurns)} of {maxTurns}</span>
                    </div>
                </div>
            </div>

            <div className="chat-messages-area">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`chat-row ${msg.role === 'model' ? 'ai-row' : 'user-row'}`}
                        >
                            {msg.role === 'model' && (
                                <div className="chat-avatar ai-avatar">
                                    <Bot size={18} />
                                </div>
                            )}

                            <div className="chat-bubble-wrapper">
                                <div className={`chat-bubble ${msg.role}`}>
                                    <div className="chat-arabic" dir="rtl">{msg.arabic}</div>
                                    {msg.english && <div className="chat-english">{msg.english}</div>}
                                </div>

                                {msg.correction && (
                                    <div className="chat-correction-chip">
                                        ✨ {msg.correction}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isListening && transcript && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="chat-row user-row preview-row"
                        >
                            <div className="chat-bubble-wrapper">
                                <div className="chat-bubble user preview">
                                    <div className="chat-arabic" dir="rtl">{transcript}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="chat-row ai-row typing-row"
                        >
                            <div className="chat-avatar ai-avatar">
                                <Bot size={18} />
                            </div>
                            <div className="chat-bubble ai typing">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} className="scroll-anchor" />
            </div>

            <div className="chat-input-area">
                {turnCount >= maxTurns ? (
                    <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="chat-action-btn complete-btn"
                        onClick={onComplete}
                    >
                        <CheckCircle size={22} className="btn-icon" />
                        Finish Conversation
                    </motion.button>
                ) : (
                    <button
                        className={`chat-action-btn mic-btn ${isListening ? 'recording' : ''}`}
                        onMouseDown={() => startListening()}
                        onMouseUp={() => stopListening()}
                        onTouchStart={() => startListening()}
                        onTouchEnd={() => stopListening()}
                        disabled={isGenerating}
                    >
                        <div className={`mic-ring ${isListening ? 'pulsing' : ''}`}>
                            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                        </div>
                        <span className="btn-label">{isListening ? 'Release to Send' : 'Hold to Speak'}</span>
                    </button>
                )}
            </div>
        </div>
    );
};
