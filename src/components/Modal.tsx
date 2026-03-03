import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    type?: 'info' | 'warning' | 'error' | 'success';
    actions?: React.ReactNode;
}

const typeColors = {
    info: { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', accent: '#60A5FA' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', accent: '#FBBF24' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', accent: '#F87171' },
    success: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22C55E', accent: '#4ADE80' },
};

const typeIcons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, type = 'info', actions }) => {
    const colors = typeColors[type];
    const icon = typeIcons[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        padding: '24px',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--color-surface, #122820)',
                            borderRadius: '20px',
                            border: `1px solid ${colors.border}40`,
                            maxWidth: '420px',
                            width: '100%',
                            overflow: 'hidden',
                            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px ${colors.border}10`,
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '24px 24px 16px 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid var(--color-border, #1F4234)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '24px' }}>{icon}</span>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: colors.accent,
                                    fontFamily: "'Outfit', sans-serif",
                                }}>
                                    {title}
                                </h3>
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--color-text-muted, #9BB8AA)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{
                            padding: '20px 24px',
                            color: 'var(--color-text-main, #F4F8F6)',
                            fontSize: '15px',
                            lineHeight: 1.6,
                        }}>
                            {children}
                        </div>

                        {/* Actions */}
                        {actions && (
                            <div style={{
                                padding: '16px 24px 24px 24px',
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                            }}>
                                {actions}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Convenience button styles
export const ModalButton: React.FC<{
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    children: React.ReactNode;
}> = ({ onClick, variant = 'primary', children }) => {
    const styles: Record<string, React.CSSProperties> = {
        primary: {
            background: 'linear-gradient(135deg, #D4AF37, #B5952F)',
            color: '#0A1914',
            fontWeight: 700,
        },
        secondary: {
            background: 'transparent',
            color: 'var(--color-text-muted, #9BB8AA)',
            border: '1px solid var(--color-border, #1F4234)',
        },
        danger: {
            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
            color: 'white',
            fontWeight: 700,
        },
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                ...styles[variant],
                padding: '12px 24px',
                borderRadius: '12px',
                border: styles[variant].border as string || 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: styles[variant].fontWeight as number || 600,
            }}
        >
            {children}
        </motion.button>
    );
};
