import React, { useState, useEffect } from 'react';
import { Player, Word } from '../../types';
import { FULL_WORD_LIST, generateOptions } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, Card, PlayerAvatar } from '../UI';
import { ArrowLeft, Volume2, BookOpen, Star } from '../Icons';

interface MistakePracticeProps {
    player: Player;
    onRemoveMistake: (wordId: number) => void;
    onExit: () => void;
}

const MistakePractice: React.FC<MistakePracticeProps> = ({ player, onRemoveMistake, onExit }) => {
    // Filter full list to find user's mistake words
    const mistakes = FULL_WORD_LIST.filter(w => player.mistakes.includes(w.id));
    
    // Sort slightly randomly or just by id
    const [practiceList, setPracticeList] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<Word[]>([]);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

    useEffect(() => {
        // Initialize list
        setPracticeList(mistakes.sort(() => 0.5 - Math.random()));
    }, [player.mistakes.length]); // Re-shuffle if count changes significantly or on mount

    const currentWord = practiceList[currentIndex];

    useEffect(() => {
        if (!currentWord) return;
        setOptions(generateOptions(currentWord));
        setFeedback(null);
        const timer = setTimeout(() => AudioEngine.speak(currentWord.word), 500);
        return () => clearTimeout(timer);
    }, [currentIndex, currentWord]);

    const handleAnswer = (ans: Word) => {
        if (feedback) return; // Prevent double clicks

        if (ans.id === currentWord.id) {
            AudioEngine.playWin();
            setFeedback('CORRECT');
            setTimeout(() => {
                onRemoveMistake(currentWord.id);
                // Remove from local list to avoid index issues if we want instant update
                const newList = practiceList.filter(w => w.id !== currentWord.id);
                setPracticeList(newList);
                
                // If we are at the end, go back to 0 or stay if list empty
                if (currentIndex >= newList.length) {
                    setCurrentIndex(0);
                }
                setFeedback(null);
            }, 1000);
        } else {
            AudioEngine.playDamage();
            setFeedback('WRONG');
            setTimeout(() => {
                setFeedback(null);
                // Move to next anyway to keep flow? Or retry? 
                // Let's move next to keep it snappy, but don't remove.
                setCurrentIndex((prev) => (prev + 1) % practiceList.length);
            }, 1000);
        }
    };

    if (mistakes.length === 0) {
        return (
            <div className="h-[100dvh] bg-amber-100 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-white border-8 border-amber-300">
                    <div className="text-8xl mb-6">🎉</div>
                    <h2 className="text-3xl font-black text-amber-800 mb-4">太棒了!</h2>
                    <p className="text-xl font-bold text-gray-600 mb-8">你没有错题了!</p>
                    <Button onClick={onExit} variant="secondary" className="w-full">
                        返回
                    </Button>
                </Card>
            </div>
        );
    }

    if (!currentWord) return <div>Loading...</div>;

    const optionColors = [
        "bg-white border-gray-300 text-gray-800",
        "bg-white border-gray-300 text-gray-800",
        "bg-white border-gray-300 text-gray-800",
        "bg-white border-gray-300 text-gray-800"
    ];

    return (
        <div className="h-[100dvh] bg-amber-200 flex flex-col overflow-hidden select-none font-sans">
            {/* Header */}
            <div className="bg-amber-700 text-white p-4 flex items-center justify-between shadow-md">
                <Button variant="secondary" onClick={onExit} className="px-3 py-2"><ArrowLeft size={20}/></Button>
                <div className="flex items-center gap-2">
                    <BookOpen size={24} className="text-yellow-300"/>
                    <span className="text-xl font-black">错题本</span>
                </div>
                <div className="bg-black/20 px-3 py-1 rounded font-bold">
                    剩余: {practiceList.length}
                </div>
            </div>

            {/* Practice Area */}
            <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
                {/* Character/Feedback Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative">
                    <div className="mb-6 scale-125">
                         <PlayerAvatar avatar={player.avatar} size="md" className="border-4 border-amber-500 shadow-xl"/>
                    </div>
                    
                    {feedback === 'CORRECT' && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-6xl font-black text-green-600 drop-shadow-lg animate-bounce bg-white/80 p-4 rounded-xl border-4 border-green-500">
                                正确! 🎉
                            </div>
                        </div>
                    )}
                    
                    {feedback === 'WRONG' && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="text-6xl font-black text-red-600 drop-shadow-lg animate-shake bg-white/80 p-4 rounded-xl border-4 border-red-500">
                                错误 ❌
                            </div>
                        </div>
                    )}

                    <Button onClick={() => AudioEngine.speak(currentWord.word)} variant="secondary" className="mb-4 py-3 px-8 text-xl shadow-lg border-b-4 bg-white">
                        <Volume2 size={32} className="mr-2"/> 听音辨字
                    </Button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4 h-1/2 pb-4">
                     {options.map((opt, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleAnswer(opt)} 
                            className={`h-full rounded-xl border-b-8 font-black text-5xl sm:text-6xl shadow-md active:scale-95 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center hover:bg-amber-50 ${optionColors[i % 4]}`}
                          >
                              {opt.word}
                          </button>
                      ))}
                </div>
            </div>
        </div>
    );
};

export default MistakePractice;