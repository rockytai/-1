import React, { useState, useEffect } from 'react';
import { VersusConfig, Word } from '../../types';
import { generateOptions } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, Card, ProgressBar, PlayerAvatar } from '../UI';
import { Volume2 } from '../Icons';

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
        gameWinner: null as 'p1' | 'p2' | null
    });
    
    const [options, setOptions] = useState<Word[]>([]);
    const [roundResult, setRoundResult] = useState<'P1_WIN' | 'P2_WIN' | null>(null);

    const currentWord = versusState.words[versusState.currentIndex];

    useEffect(() => {
        if (!currentWord) return;
        setOptions(generateOptions(currentWord));
        setRoundResult(null);
        AudioEngine.speak(currentWord.word);
    }, [versusState.currentIndex, currentWord]);

    // AI Logic Effect
    useEffect(() => {
        if (config.opponentType !== 'COMPUTER') return;
        if (roundResult) return; 
        if (!currentWord) return;

        const reactionTime = Math.random() * 2000 + 1500; 
        
        const timer = setTimeout(() => {
            const isCorrect = Math.random() < 0.85;
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
    }, [versusState.currentIndex, options, roundResult]);

    const handleAnswer = (player: 'p1' | 'p2', answer: Word) => {
        if (roundResult) return; 
        
        if (answer.id === currentWord.id) {
            AudioEngine.playAttack();
            const damage = 20;
            const newState = { ...versusState };
            
            let winnerKey: 'P1_WIN' | 'P2_WIN';
            if (player === 'p1') {
                newState.p2.hp -= damage;
                newState.p1.score += 10;
                winnerKey = 'P1_WIN';
            } else {
                newState.p1.hp -= damage;
                newState.p2.score += 10;
                winnerKey = 'P2_WIN';
            }
            
            setVersusState(newState);
            setRoundResult(winnerKey);

            setTimeout(() => {
                if (newState.p1.hp <= 0 || newState.p2.hp <= 0) {
                     setVersusState(prev => ({ ...prev, gameWinner: prev.p1.hp > 0 ? 'p1' : 'p2' }));
                } else {
                     setVersusState(prev => ({
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.words.length
                     }));
                }
            }, 1500);
        } else {
            AudioEngine.playDamage();
        }
    };

    if (versusState.gameWinner) {
        return (
            <div className="h-[100dvh] bg-gray-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-yellow-50">
                    <h1 className="text-4xl font-black mb-4">🏆 获胜者 🏆</h1>
                    <div className="flex justify-center mb-6">
                        <PlayerAvatar 
                            avatar={versusState.gameWinner === 'p1' ? versusState.p1.avatar : versusState.p2.avatar} 
                            size="lg" 
                            className="scale-150 border-4 border-yellow-500"
                        />
                    </div>
                    <h2 className="text-2xl font-bold mb-8">
                        {versusState.gameWinner === 'p1' ? versusState.p1.name : versusState.p2.name}
                    </h2>
                    <Button onClick={onExit} className="w-full">返回菜单</Button>
                </Card>
            </div>
        );
    }

    if (!currentWord) return <div>加载中...</div>;

    const isComputer = config.opponentType === 'COMPUTER';

    return (
        <div className="h-[100dvh] w-full flex flex-col bg-gray-800 overflow-hidden relative">
            {roundResult && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/80 text-white px-8 py-4 rounded-xl font-black text-4xl animate-bounce border-4 border-white z-50">
                        {roundResult === 'P1_WIN' ? `${versusState.p1.name} 获胜!` : `${versusState.p2.name} 获胜!`}
                    </div>
                </div>
            )}

            {/* PLAYER 2 AREA */}
            <div className={`flex-1 bg-red-100 flex flex-col relative rotate-180 border-t-8 border-gray-900 ${isComputer ? 'opacity-90 pointer-events-none' : ''}`}>
                 <div className="flex justify-between items-center p-2 bg-red-200">
                    <div className="flex items-center gap-2">
                        <PlayerAvatar avatar={versusState.p2.avatar} size="sm" />
                        <span className="font-bold">{versusState.p2.name}</span>
                    </div>
                    <div className="w-1/2">
                        <ProgressBar current={versusState.p2.hp} max={100} color="bg-red-500" label="生命" />
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center p-4">
                     <button onClick={() => AudioEngine.speak(currentWord.word)} className="mb-6 p-4 bg-white/50 rounded-full shadow-sm active:scale-95 transform rotate-0 text-gray-800">
                        <Volume2 size={48} />
                     </button>
                     <div className="grid grid-cols-2 gap-2 w-full">
                         {options.map((opt, i) => (
                             <button 
                                key={i} 
                                onClick={() => handleAnswer('p2', opt)} 
                                disabled={isComputer}
                                className="bg-white p-4 rounded-xl border-b-4 border-gray-300 font-black text-3xl shadow-sm active:scale-95 disabled:active:scale-100 disabled:opacity-100"
                             >
                                 {opt.word}
                             </button>
                         ))}
                     </div>
                 </div>
                 {isComputer && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-black/10 px-4 py-2 rounded-lg font-bold text-red-900 transform rotate-180 animate-pulse">
                            思考中...
                        </div>
                    </div>
                 )}
            </div>

            <div className="h-2 bg-black z-10 flex items-center justify-center">
                <div className="bg-black text-white px-4 py-1 rounded-full text-xs font-bold">VS</div>
            </div>

            {/* PLAYER 1 AREA */}
            <div className="flex-1 bg-blue-100 flex flex-col relative">
                <div className="flex justify-between items-center p-2 bg-blue-200">
                    <div className="flex items-center gap-2">
                        <PlayerAvatar avatar={versusState.p1.avatar} size="sm" />
                        <span className="font-bold">{versusState.p1.name}</span>
                    </div>
                    <div className="w-1/2">
                        <ProgressBar current={versusState.p1.hp} max={100} color="bg-blue-500" label="生命" />
                    </div>
                 </div>
                 <div className="flex-1 flex flex-col items-center justify-center p-4">
                     <button onClick={() => AudioEngine.speak(currentWord.word)} className="mb-6 p-4 bg-white/50 rounded-full shadow-sm active:scale-95 text-gray-800">
                        <Volume2 size={48} />
                     </button>
                     <div className="grid grid-cols-2 gap-2 w-full">
                         {options.map((opt, i) => (
                             <button key={i} onClick={() => handleAnswer('p1', opt)} className="bg-white p-4 rounded-xl border-b-4 border-gray-300 font-black text-3xl shadow-sm active:scale-95">
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