import React, { useState, useEffect } from 'react';
import { Player, Word, BattleResult } from '../../types';
import { WORLDS, getWordsForLevel, generateOptions } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, ProgressBar, PlayerAvatar } from '../UI';
import { ArrowLeft, Trophy, Heart, Volume2 } from '../Icons';

interface SinglePlayerBattleProps {
    level: number;
    currentPlayer: Player;
    onWin: (mistakes: number) => void;
    onLose: () => void;
    onExit: () => void;
}

const SinglePlayerBattle: React.FC<SinglePlayerBattleProps> = ({ level, currentPlayer, onWin, onLose, onExit }) => {
    const worldId = Math.ceil(level / 10);
    const world = WORLDS.find(w => w.id === worldId);
    
    if(!world) return <div>加载世界出错</div>;

    const startLvl = (worldId - 1) * 10 + 1;
    const enemyMaxHP = world.hp + ((level - startLvl) * 5);
    
    const [battleState, setBattleState] = useState({
        hp: 100,
        enemyHp: enemyMaxHP,
        words: getWordsForLevel(level).sort(() => 0.5 - Math.random()),
        currentIndex: 0,
        mistakes: 0,
        message: "",
        anim: null as 'player' | 'enemy' | null,
        shake: false
    });
    
    const [options, setOptions] = useState<Word[]>([]);
    
    const currentWord = battleState.words[battleState.currentIndex];

    useEffect(() => {
        if (!currentWord) return;
        setOptions(generateOptions(currentWord));
        // Small delay to allow render before speak
        const timer = setTimeout(() => AudioEngine.speak(currentWord.word), 500);
        return () => clearTimeout(timer);
    }, [battleState.currentIndex, currentWord]);

    const handleAnswer = (ans: Word) => {
        if (ans.id === currentWord.id) {
            AudioEngine.playAttack();
            const dmg = Math.ceil(enemyMaxHP / 10 * 1.2);
            const newEnemyHp = Math.max(0, battleState.enemyHp - dmg);

            setBattleState(prev => ({
                ...prev,
                enemyHp: newEnemyHp,
                message: "太棒了!",
                anim: 'player'
            }));

            setTimeout(() => {
                if (newEnemyHp <= 0) {
                    AudioEngine.playWin();
                    onWin(battleState.mistakes);
                } else {
                    setBattleState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, message: "", anim: null }));
                }
            }, 800);
        } else {
            AudioEngine.playDamage();
            const dmg = 34; 
            const newHp = Math.max(0, battleState.hp - dmg);
            
            setBattleState(prev => ({
                ...prev,
                hp: newHp,
                mistakes: prev.mistakes + 1,
                message: `错误! 是 ${currentWord.word}`, 
                anim: 'enemy',
                shake: true
            }));

            setTimeout(() => {
                setBattleState(prev => ({ ...prev, shake: false, anim: null }));
                if (newHp <= 0) {
                    AudioEngine.playFail();
                    onLose();
                } else {
                    setOptions(generateOptions(currentWord));
                    setBattleState(prev => ({ ...prev, message: "" }));
                }
            }, 1000);
        }
    };

    if (!currentWord) return <div>加载中...</div>;

    return (
          <div className={`h-[100dvh] bg-sky-200 flex flex-col overflow-hidden select-none ${battleState.shake ? 'animate-shake' : ''}`}>
              <div className="bg-gray-900 text-white p-2 flex justify-between items-center z-10 shadow-md">
                  <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={onExit} className="px-2 py-1 text-xs"><ArrowLeft/></Button>
                      <div className="font-bold text-yellow-400 flex items-center gap-1"><Trophy size={14}/> {level}</div>
                  </div>
                  <div className="flex gap-1">
                      {[1,2,3].map(h => (
                          <Heart key={h} size={16} className={h <= (3 - battleState.mistakes) ? "text-red-500 fill-red-500" : "text-gray-600 fill-gray-600"} />
                      ))}
                  </div>
              </div>

              <div className={`flex-1 relative flex items-center justify-between px-4 sm:px-12 py-4 ${world.bgPattern}`}>
                  <div className={`flex flex-col items-center transition-transform duration-200 ${battleState.anim === 'player' ? 'translate-x-8 scale-110 z-20' : ''}`}>
                        <ProgressBar current={battleState.hp} max={100} color="bg-green-500" label={currentPlayer.name} />
                        <PlayerAvatar avatar={currentPlayer.avatar} size="lg" className="mt-2 border-4 border-white shadow-xl" />
                  </div>

                  {battleState.message && (
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-black/80 text-yellow-400 px-4 py-2 rounded-xl font-bold animate-bounce z-30 whitespace-nowrap">
                          {battleState.message}
                      </div>
                  )}

                  <div className={`flex flex-col items-center transition-transform duration-200 ${battleState.anim === 'enemy' ? '-translate-x-8 scale-110 z-20' : ''}`}>
                      <ProgressBar current={battleState.enemyHp} max={enemyMaxHP} color="bg-red-500" label={world.enemy} reverse />
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-full border-4 border-red-900 flex items-center justify-center text-6xl shadow-xl mt-2">
                          {world.img}
                      </div>
                  </div>
              </div>

              <div className="bg-gray-100 p-4 border-t-8 border-gray-300 pb-8">
                  <div className="flex flex-col items-center mb-6">
                      <button onClick={() => AudioEngine.speak(currentWord.word)} className="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center gap-2 text-lg font-bold shadow-md active:scale-95 animate-pulse">
                          <Volume2 size={24}/> 听发音
                      </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      {options.map((opt, i) => (
                          <Button key={i} onClick={() => handleAnswer(opt)} variant="secondary" className="h-24 text-4xl normal-case font-black">
                              {opt.word}
                          </Button>
                      ))}
                  </div>
              </div>
          </div>
    );
};
export default SinglePlayerBattle;