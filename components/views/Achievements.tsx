import React from 'react';
import { Player } from '../../types';
import { ACHIEVEMENTS } from '../../constants';
import { Button, Card } from '../UI';
import { ArrowLeft, Star } from '../Icons';

interface AchievementsProps {
    player: Player;
    onBack: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ player, onBack }) => {
    return (
        <div className="h-[100dvh] bg-slate-700 flex items-center justify-center p-4 font-sans">
             <Card className="max-w-md w-full p-6 bg-white flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-4">
                    <Button variant="secondary" onClick={onBack} className="px-3 py-2"><ArrowLeft size={20}/></Button>
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2 text-slate-800">
                        <Star className="text-yellow-500" /> 成就
                    </h2>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {ACHIEVEMENTS.map(ach => {
                        const isUnlocked = player.unlockedAchievements.includes(ach.id);
                        return (
                            <div key={ach.id} className={`flex items-center p-4 rounded-xl border-4 shadow-sm ${isUnlocked ? 'bg-amber-50 border-amber-300' : 'bg-gray-100 border-gray-300 grayscale opacity-70'}`}>
                                <div className="text-4xl mr-4">{ach.icon}</div>
                                <div className="flex-1">
                                    <div className="font-black text-lg text-gray-800">{ach.title}</div>
                                    <div className="text-sm font-bold text-gray-500">{ach.desc}</div>
                                </div>
                                {isUnlocked && <div className="text-2xl text-green-500">✅</div>}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 text-center font-bold text-gray-500">
                    解锁进度: {player.unlockedAchievements.length} / {ACHIEVEMENTS.length}
                </div>
            </Card>
        </div>
    );
};
export default Achievements;
