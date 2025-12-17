import React from 'react';
import { Player } from '../../types';
import { Button, Card, PlayerAvatar } from '../UI';
import { ArrowLeft, Star, Trophy } from '../Icons';

interface LeaderboardProps {
    players: Player[];
    currentPlayerId: number;
    onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ players, currentPlayerId, onBack }) => {
    // Sort by Total Score, then by Stars
    const sortedPlayers = [...players].map(p => ({
        ...p,
        // Migration check for old data display
        totalScore: p.totalScore || Object.values(p.highScores || {}).reduce((a: number, b: number) => a + b, 0),
        totalStars: Object.values(p.stars).reduce((a: number, b: number) => a + b, 0)
    })).sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return b.totalStars - a.totalStars;
    });

    return (
        <div className="h-[100dvh] bg-indigo-500 flex items-center justify-center p-4 font-sans">
            <Card className="max-w-md w-full p-6 bg-white flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-gray-100 pb-4">
                    <Button variant="secondary" onClick={onBack} className="px-3 py-2"><ArrowLeft size={20}/></Button>
                    <h2 className="text-2xl font-black uppercase flex items-center gap-2 text-indigo-800">
                        <Trophy className="text-yellow-500" /> 排行榜
                    </h2>
                    <div className="w-10"></div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {sortedPlayers.map((p, index) => {
                        const isMe = p.id === currentPlayerId;
                        let rankColor = "bg-gray-100 border-gray-300 text-gray-600";
                        if (index === 0) rankColor = "bg-yellow-100 border-yellow-400 text-yellow-700";
                        if (index === 1) rankColor = "bg-gray-200 border-gray-400 text-gray-700";
                        if (index === 2) rankColor = "bg-orange-100 border-orange-400 text-orange-700";

                        return (
                            <div key={p.id} className={`flex items-center p-3 rounded-lg border-b-4 ${isMe ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-400' : 'bg-white border-gray-200'} transition-transform hover:scale-[1.01]`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg mr-3 border-2 ${rankColor}`}>
                                    {index + 1}
                                </div>
                                <PlayerAvatar avatar={p.avatar} size="sm" className="mr-3" />
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold truncate ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                                        {p.name} {isMe && '(我)'}
                                    </div>
                                    <div className="text-xs text-gray-500 font-bold flex gap-2">
                                        <span>Lv.{p.maxUnlockedLevel}</span>
                                        <span className="text-yellow-600 flex items-center gap-0.5">{p.totalStars}<Star size={10}/></span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="font-black text-lg text-indigo-600">
                                        {p.totalScore.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] uppercase font-bold text-gray-400">总分</div>
                                </div>
                            </div>
                        );
                    })}
                    {sortedPlayers.length === 0 && (
                        <div className="text-center text-gray-400 font-bold py-10">暂无数据</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Leaderboard;