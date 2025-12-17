import React, { useState, useEffect } from 'react';
import { VersusConfig, Word } from '../../types';
import { generateOptions } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, Card, ProgressBar, PlayerAvatar } from '../UI';
import { Volume2, ArrowLeft } from '../Icons';

interface VersusGameProps {
    config: VersusConfig;
    onExit: () => void;
}

const VersusGame: React.FC<VersusGameProps> = ({ config, onExit }) => {
    const [versusState, setVersusState] = useState({
        p1: config.p1,
        p2: config.p2,
        words: config.words,
        currentIndex: 0,
        gameWinner: null as 'p1' | 'p2' | 'draw' | null
    });
    
    const [options, setOptions] = useState<Word[]>([]);
    const [roundResult, setRoundResult] = useState<'P1_WIN' | 'P2_WIN' | null>(null);
    const [timeLeft, setTimeLeft] = useState(60); // 60s for Time Attack
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    const currentWord = versusState.words[versusState.currentIndex];
    const isRace = config.gameMode === 'RACE_TO_10';
    const targetScore = 10;

    // Timer logic for Time Attack
    useEffect(() => {
        if (config.gameMode === 'TIME_ATTACK' && !versusState.gameWinner && timeLeft > 0 && !showExitConfirm) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time up
                        let winner: 'p1' | 'p2' | 'draw' = 'draw';
                        if (versusState.p1.score > versusState.p2.score) winner = 'p1';
                        else if (versusState.p2.score > versusState.p1.score) winner = 'p2';
                        setVersusState(s => ({ ...s, gameWinner: winner }));
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [config.gameMode, timeLeft, versusState.gameWinner, versusState.p1.score, versusState.p2.score, showExitConfirm]);

    useEffect(() => {
        if (!currentWord || versusState.gameWinner) return;
        setOptions(generateOptions(currentWord));
        setRoundResult(null);
        AudioEngine.speak(currentWord.word);
    }, [versusState.currentIndex, currentWord, versusState.gameWinner]);

    // AI Logic Effect
    useEffect(() => {
        if (config.opponentType !== 'COMPUTER') return;
        if (roundResult || versusState.gameWinner || showExitConfirm) return; 
        if (!currentWord) return;

        const reactionTime = Math.random() * 2000 + 1000; // Faster reaction for blocky bot
        
        const timer = setTimeout(() => {
            if (showExitConfirm) return; // Don't answer if paused

            const isCorrect = Math.random() < 0.80;
            let chosenOption;
            
            if (isCorrect) {
                chosenOption = options.find(o => o.id === currentWord.id);
            } else {
                const wrongOptions = options.filter(o => o.id !== currentWord.id);
                if (wrongOptions.length > 0) {
                    chosenOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                } else {
                    chosenOption = options[0]; 
                }
            }
            
            if (chosenOption) {
                handleAnswer('p2', chosenOption);
            }

        }, reactionTime);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [versusState.currentIndex, options, roundResult, versusState.gameWinner, showExitConfirm]);

    const handleAnswer = (player: 'p1' | 'p2', answer: Word) => {
        if (roundResult || versusState.gameWinner || showExitConfirm) return; 
        
        if (answer.id === currentWord.id) {
            AudioEngine.playAttack();
            
            setVersusState(prev => {
                const newState = { ...prev };
                if (player === 'p1') newState.p1.score += 1;
                else newState.p2.score += 1;

                // Check Win Condition for Race to 10
                if (isRace) {
                    if (newState.p1.score >= targetScore) newState.gameWinner = 'p1';
                    else if (newState.p2.score >= targetScore) newState.gameWinner = 'p2';
                }

                return newState;
            });

            // If not game over immediately, proceed
            if (!isRace || (isRace && versusState.p1.score < targetScore && versusState.p2.score < targetScore)) {
                 setRoundResult(player === 'p1' ? 'P1_WIN' : 'P2_WIN');
                 setTimeout(() => {
                     setVersusState(prev => {
                         if (prev.gameWinner) return prev;
                         return {
                            ...prev,
                            currentIndex: (prev.currentIndex + 1) % prev.words.length
                         };
                     });
                 }, 1000);
            }
        } else {
            AudioEngine.playDamage();
            // Optional: Penalty time or visual shake?
        }
    };

    if (versusState.gameWinner) {
        return (
            <div className="h-[100dvh] bg-blue-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-white border-8 border-black">
                    <h1 className="text-4xl font-black mb-4 uppercase">
                        {versusState.gameWinner === 'draw' ? "平局!" : "🏆 胜利! 🏆"}
                    </h1>
                    {versusState.gameWinner !== 'draw' && (
                        <div className="flex justify-center mb-6">
                            <PlayerAvatar 
                                avatar={versusState.gameWinner === 'p1' ? versusState.p1.avatar : versusState.p2.avatar} 
                                size="lg" 
                                className="scale-125 border-4 border-yellow-500"
                            />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold mb-4">
                        {versusState.gameWinner === 'p1' ? versusState.p1.name : 
                         versusState.gameWinner === 'p2' ? versusState.p2.name : 
                         "势均力敌"}
                    </h2>
                    <div className="text-xl font-mono bg-gray-100 p-2 rounded mb-8">
                        {versusState.p1.score} - {versusState.p2.score}
                    </div>
                    <Button onClick={onExit} variant="primary" className="w-full">返回大厅</Button>
                </Card>
            </div>
        );
    }

    if (!currentWord) return <div>加载中...</div>;

    const isComputer = config.opponentType === 'COMPUTER';
    
    // Background colors for options
    const optionColors = [
        "bg-red-500 border-red-700 text-white",
        "bg-blue-500 border-blue-700 text-white",
        "bg-green-500 border-green-700 text-white",
        "bg-yellow-400 border-yellow-600 text-black"
    ];

    return (
        <div className="h-[100dvh] w-full flex flex-col bg-gray-800 overflow-hidden relative font-sans">
            {roundResult && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className={`px-8 py-4 rounded-md font-black text-4xl animate-bounce border-4 border-white z-50 shadow-xl uppercase transform rotate-[-5deg] ${roundResult === 'P1_WIN' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                        +1 分!
                    </div>
                </div>
            )}
            
            {showExitConfirm && (
                <div className="absolute inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
                     <Card className="bg-white p-6 w-full max-w-sm text-center border-4 border-white">
                         <h2 className="text-2xl font-black mb-4">退出对战?</h2>
                         <p className="mb-6 font-bold text-gray-600">现在的进度将会丢失。</p>
                         <div className="flex gap-4">
                             <Button onClick={() => setShowExitConfirm(false)} variant="secondary" className="flex-1">继续</Button>
                             <Button onClick={onExit} variant="danger" className="flex-1">退出</Button>
                         </div>
                     </Card>
                </div>
            )}

            {/* PLAYER 2 AREA (Inverted) */}
            <div className={`flex-1 bg-red-100 flex flex-col relative rotate-180 border-t-8 border-gray-900 ${isComputer ? 'opacity-90 pointer-events-none' : ''}`}>
                 <div className="flex justify-between items-center p-2 bg-red-200 border-b-4 border-red-300 shrink-0">
                    <div className="flex items-center gap-2">
                        <PlayerAvatar avatar={versusState.p2.avatar} size="sm" />
                        <span className="font-black text-lg">{versusState.p2.name}</span>
                    </div>
                    <div className="w-1/2">
                        {isRace ? (
                             <ProgressBar current={versusState.p2.score} max={targetScore} color="bg-red-500" label="得分" />
                        ) : (
                             <div className="text-right font-black text-2xl text-red-600">{versusState.p2.score} 分</div>
                        )}
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col items-center p-2 min-h-0">
                     <button onClick={() => AudioEngine.speak(currentWord.word)} className="mb-2 p-2 bg-white border-4 border-gray-300 rounded-lg shadow-sm active:scale-95 transform rotate-0 text-gray-800 shrink-0">
                        <Volume2 size={32} />
                     </button>
                     <div className="flex-1 grid grid-cols-2 gap-2 w-full min-h-0">
                         {options.map((opt, i) => (
                             <button 
                                key={i} 
                                onClick={() => handleAnswer('p2', opt)} 
                                disabled={isComputer || showExitConfirm}
                                className={`w-full h-full rounded-md border-b-8 font-black text-5xl sm:text-6xl shadow-sm active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1 transition-all flex items-center justify-center ${optionColors[i % 4]}`}
                             >
                                 {opt.word}
                             </button>
                         ))}
                     </div>
                 </div>
            </div>

            {/* CENTER BAR - Symmetric Layout */}
            <div className="h-14 bg-gray-900 z-10 flex items-center justify-between px-4 border-y-4 border-gray-700 relative shrink-0">
                 {/* Left: Back Button */}
                 <div className="flex-1 flex justify-start">
                     <button onClick={() => setShowExitConfirm(true)} className="bg-gray-700 text-white p-2 rounded-md border-b-4 border-gray-800 active:translate-y-1 active:border-b-0 active:mt-1 hover:bg-gray-600 transition-colors">
                         <ArrowLeft size={20} />
                     </button>
                 </div>
                 
                 {/* Center: VS Badge */}
                 <div className="shrink-0 bg-black text-white px-4 py-1 rounded-md text-xl font-black tracking-widest uppercase border-2 border-gray-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                     VS
                 </div>

                 {/* Right: Timer/Target */}
                 <div className="flex-1 flex justify-end">
                    <div className="text-white font-black text-lg bg-gray-800 px-3 py-1 rounded border border-gray-600 min-w-[80px] text-center">
                        {config.gameMode === 'TIME_ATTACK' ? `⏱️ ${timeLeft}` : `🏁 10`}
                    </div>
                 </div>
            </div>

            {/* PLAYER 1 AREA */}
            <div className="flex-1 bg-blue-100 flex flex-col relative">
                <div className="flex justify-between items-center p-2 bg-blue-200 border-b-4 border-blue-300 shrink-0">
                    <div className="flex items-center gap-2">
                        <PlayerAvatar avatar={versusState.p1.avatar} size="sm" />
                        <span className="font-black text-lg">{versusState.p1.name}</span>
                    </div>
                    <div className="w-1/2">
                        {isRace ? (
                             <ProgressBar current={versusState.p1.score} max={targetScore} color="bg-blue-500" label="得分" />
                        ) : (
                             <div className="text-right font-black text-2xl text-blue-600">{versusState.p1.score} 分</div>
                        )}
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col items-center p-2 min-h-0">
                     <button onClick={() => AudioEngine.speak(currentWord.word)} className="mb-2 p-2 bg-white border-4 border-gray-300 rounded-lg shadow-sm active:scale-95 text-gray-800 shrink-0">
                        <Volume2 size={32} />
                     </button>
                     <div className="flex-1 grid grid-cols-2 gap-2 w-full min-h-0">
                         {options.map((opt, i) => (
                             <button 
                                key={i} 
                                onClick={() => handleAnswer('p1', opt)} 
                                disabled={showExitConfirm}
                                className={`w-full h-full rounded-md border-b-8 font-black text-5xl sm:text-6xl shadow-sm active:scale-95 active:border-b-0 translate-y-0 active:translate-y-1 transition-all flex items-center justify-center ${optionColors[i % 4]}`}
                             >
                                 {opt.word}
                             </button>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    );
};
export default VersusGame;