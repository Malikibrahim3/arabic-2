import { useCallback } from 'react';
import {
    play as enginePlay,
    playLetterName as enginePlayLetterName,
    playLetterSound as enginePlayLetterSound,
    playCorrectSound,
    playWrongSound,
    playCompletionSound,
    stopAudio,
    PlaybackSpeed,
} from '../audio/AudioEngine';

/**
 * useAudio — React hook for audio playback in exercises.
 *
 * Usage:
 *   const { play, playLetterName, playCorrectSound, playWrongSound } = useAudio();
 *   play('بَ');                        // Play letter sound
 *   play('word_bayt', PlaybackSpeed.Slow);  // Play word at slow speed
 *   playLetterName('ب');              // Play "باء"
 */
export function useAudio() {
    const play = useCallback((input: string, speed: PlaybackSpeed = PlaybackSpeed.Normal) => {
        return enginePlay(input, speed);
    }, []);

    const playLetterName = useCallback((letter: string, speed: PlaybackSpeed = PlaybackSpeed.Normal) => {
        return enginePlayLetterName(letter, speed);
    }, []);

    const playLetterSound = useCallback((letter: string, speed: PlaybackSpeed = PlaybackSpeed.Normal) => {
        return enginePlayLetterSound(letter, speed);
    }, []);

    return {
        play,
        playLetterName,
        playLetterSound,
        playCorrectSound,
        playWrongSound,
        playCompletionSound,
        stopAudio,
        PlaybackSpeed,
    };
}
