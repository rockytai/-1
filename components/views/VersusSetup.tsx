import React, { useState } from 'react';
import { Player, VersusConfig, BattlePlayer } from '../../types';
import { Button, Card, PlayerAvatar } from '../UI';
import { ArrowLeft, Users, Cpu } from '../Icons';
import { getRandomWords, getWordsForLevel } from '../../constants';

interface VersusSetupProps {
    currentPlayer: Player;
    avatars: string[];
    onBack: () => void;
    onStart: (config: VersusConfig) => void;
}

const VersusSetup: React.FC<VersusSetupProps> = ({ currentPlayer, onStart, onBack, avatars }) => {
    const [opponentType, setOpponentType] = useState<'HUMAN'|'COMPUTER'>('HUMAN');
    const [p2Name, setP2Name] = useState("玩家2");
    const [p2Avatar, setP2Avatar] = useState(avatars[1]);
    const [difficulty, setDifficulty] = useState('EASY'); 
    const [manualLvl, setManualLvl] = useState(1);

    const handleStart = () => {
        let words: any[] = [];
        if (difficulty === 'EASY') words = getRandomWords(20, 1, 10);
        else if (difficulty === 'MEDIUM') words = getRandomWords(20, 11, 20);
        else if (difficulty === 'HARD') words = getRandomWords(20, 21, 30);
        else if (difficulty === 'SUPER_HARD') words = getRandomWords(20, 31, 40);
        else if (difficulty === 'RANDOM') words = getRandomWords(20, 1, 40);
        else if (difficulty === 'MANUAL') words = [...getWordsForLevel(manualLvl), ...getWordsForLevel(manualLvl)].slice(0, 20);

        const finalP2Name = opponentType === 'COMPUTER' ? "电脑AI" : p2Name;
        const finalP2Avatar = opponentType === 'COMPUTER' ? "🤖" : p2Avatar;

        const p1: BattlePlayer = { ...currentPlayer, score: 0, hp: 100 };
        const p2: BattlePlayer = { id: 999, name: finalP2Name, avatar: finalP2Avatar, score: 0, hp: 100, maxUnlockedLevel: 1, stars: {} };

        const config: VersusConfig = {
            p1,
            p2,
            words,
            opponentType
        };
        onStart(config);
    };

    return (
        <div className="h-[100dvh] bg-indigo-600 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-white overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="secondary" onClick={onBack} className="px-3 py-2"><ArrowLeft size={18}/></Button>
                    <h2 className="text-xl font-black uppercase">对战设置</h2>
                    <div className="w-8"></div> 
                </div>

                {/* Opponent Selection */}
                <div className="flex gap-2 mb-6">
                    <button 
                        onClick={() => setOpponentType('HUMAN')}
                        className={`flex-1 p-3 rounded-lg border-2 font-bold flex flex-col items-center gap-2 ${opponentType === 'HUMAN' ? 'bg-indigo-100 border-indigo-500 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                        <Users size={24}/> 真人对战
                    </button>
                    <button 
                         onClick={() => setOpponentType('COMPUTER')}
                         className={`flex-1 p-3 rounded-lg border-2 font-bold flex flex-col items-center gap-2 ${opponentType === 'COMPUTER' ? 'bg-indigo-100 border-indigo-500 text-indigo-900' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
                    >
                        <Cpu size={24}/> 人机对战
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="text-center w-1/3">
                        <PlayerAvatar avatar={currentPlayer.avatar} size="sm" className="mx-auto" />
                        <div className="font-bold mt-1 text-sm truncate">{currentPlayer.name}</div>
                    </div>
                    <div className="text-xl font-black text-red-500 w-1/3 text-center">VS</div>
                    <div className="text-center w-1/3">
                        <PlayerAvatar avatar={opponentType === 'COMPUTER' ? "🤖" : p2Avatar} size="sm" className="mx-auto" />
                        {opponentType === 'COMPUTER' ? (
                            <div className="font-bold mt-1 text-sm text-gray-600">电脑AI</div>
                        ) : (
                            <input 
                                value={p2Name} 
                                onChange={e => setP2Name(e.target.value)}
                                className="w-full text-center font-bold mt-1 text-sm border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    <label className="block font-bold text-gray-700 text-sm">选择难度:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { id: 'EASY', label: '简单 (1-10)' },
                            { id: 'MEDIUM', label: '中等 (11-20)' },
                            { id: 'HARD', label: '困难 (21-30)' },
                            { id: 'SUPER_HARD', label: '超难 (31-40)' },
                            { id: 'RANDOM', label: '随机挑战' },
                            { id: 'MANUAL', label: '自定义关卡' }
                        ].map(d => (
                            <button 
                                key={d.id}
                                onClick={() => setDifficulty(d.id)}
                                className={`p-2 rounded-lg font-bold border-2 text-sm ${difficulty === d.id ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-100 text-gray-600'}`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                    {difficulty === 'MANUAL' && (
                        <div className="flex items-center gap-2 mt-2 bg-gray-100 p-2 rounded">
                            <span className="text-sm font-bold">关卡:</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="40" 
                                value={manualLvl} 
                                onChange={e => setManualLvl(Math.min(40, Math.max(1, parseInt(e.target.value) || 1)))}
                                className="w-16 p-1 border rounded text-center font-bold"
                            />
                        </div>
                    )}
                </div>

                <Button onClick={handleStart} variant="danger" className="w-full py-3 text-lg">
                    开始对战!
                </Button>
            </Card>
        </div>
    );
};
export default VersusSetup;
