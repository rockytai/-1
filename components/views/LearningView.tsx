import React, { useState, useEffect } from 'react';
import { getWordsForLevel } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, Card } from '../UI';
import { ArrowLeft, ArrowRight, Volume2, BookOpen, Sword } from '../Icons';

interface LearningViewProps {
    level: number;
    onComplete: () => void;
    onExit: () => void;
}

const LearningView: React.FC<LearningViewProps> = ({ level, onComplete, onExit }) => {
    const words = getWordsForLevel(level);
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentWord = words[currentIndex];

    // Auto-play audio when switching words
    useEffect(() => {
        const timer = setTimeout(() => {
            AudioEngine.speak(currentWord.word);
        }, 500);
        return () => clearTimeout(timer);
    }, [currentIndex, currentWord]);

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="h-[100dvh] bg-teal-700 flex flex-col items-center justify-center p-4 font-sans select-none">
            {/* Header */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 text-white">
                <Button variant="secondary" onClick={onExit} className="px-3 py-2"><ArrowLeft size={20}/></Button>
                <div className="flex flex-col items-center">
                     <h2 className="text-2xl font-black uppercase tracking-widest text-stroke flex items-center gap-2">
                         <BookOpen className="text-yellow-400" /> 学习阶段
                     </h2>
                     <span className="text-xs font-bold opacity-80 bg-black/30 px-3 py-1 rounded-full mt-1 border border-white/20">
                         Level {level}
                     </span>
                </div>
                <Button variant="secondary" onClick={onComplete} className="px-3 py-2 text-sm font-bold">
                    跳过
                </Button>
            </div>

            {/* Flashcard */}
            <Card className="max-w-md w-full p-8 flex flex-col items-center justify-between min-h-[50vh] bg-[#fffbf0] border-8 border-teal-900 shadow-2xl relative">
                
                <div className="absolute top-4 right-4 text-sm font-black text-gray-400">
                    {currentIndex + 1} / {words.length}
                </div>

                <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {/* Hanzi */}
                    <div className="text-[8rem] font-black text-gray-900 mb-2 leading-none drop-shadow-md">
                        {currentWord.word}
                    </div>

                    {/* Audio Button */}
                    <button 
                        onClick={() => AudioEngine.speak(currentWord.word)}
                        className="mb-6 p-4 bg-teal-100 rounded-full text-teal-700 hover:bg-teal-200 active:scale-95 transition-all shadow-md border-2 border-teal-300"
                    >
                        <Volume2 size={40} />
                    </button>

                    {/* Meaning / Pinyin */}
                    <div className="text-center bg-teal-50 p-4 rounded-xl border-2 border-teal-100 w-full">
                        <div className="text-2xl font-bold text-gray-700 mb-1">
                           {currentWord.meaning}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="w-full flex gap-4 mt-8">
                    <Button 
                        onClick={handlePrev} 
                        variant="secondary" 
                        className={`flex-1 ${currentIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                    >
                        <ArrowLeft /> 上一个
                    </Button>
                    
                    {currentIndex === words.length - 1 ? (
                        <Button onClick={onComplete} variant="success" className="flex-[2] text-xl">
                            <Sword className="mr-2" /> 开始挑战
                        </Button>
                    ) : (
                        <Button onClick={handleNext} variant="primary" className="flex-[2] text-xl">
                            下一个 <ArrowRight className="ml-2" />
                        </Button>
                    )}
                </div>
            </Card>

            <div className="mt-6 text-teal-100 text-sm font-bold opacity-80">
                先记住发音和意思，再进入战斗！
            </div>
        </div>
    );
};

export default LearningView;