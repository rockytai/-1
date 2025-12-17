import React, { useState, useEffect, useRef } from 'react';
import { Player, Word } from '../../types';
import { WORLDS, getWordsForLevel, generateOptions } from '../../constants';
import { AudioEngine } from '../../utils/audio';
import { Button, ProgressBar, PlayerAvatar } from '../UI';
import { ArrowLeft, Trophy, Heart, Volume2, Clock } from '../Icons';

interface SinglePlayerBattleProps {
    level: number;
    currentPlayer: Player;
    onWin: (mistakes: number, score: number, wrongWordIds: number[]) => void;
    onLose: (wrongWordIds: number[], score: number) => void;
    onExit: () => void;
}

const SinglePlayerBattle: React.FC<SinglePlayerBattleProps> = ({ level, currentPlayer, onWin, onLose, onExit }) => {
    const worldId = Math.ceil(level / 10);
    const world = WORLDS.find(w => w.id === worldId);
    
    // Timer constants
    const TIME_LIMIT = 20;

    // Track when the current question started for time bonus
    const startTimeRef = useRef<number>(Date.now());
    
    if(!world) return <div>加载世界出错</div>;

    const startLvl = (worldId - 1) * 10 + 1;
    const enemyMaxHP = world.hp + ((level - startLvl) * 5);
    
    const [battleState, setBattleState] = useState({
        hp: 100,
        enemyHp: enemyMaxHP,
        words: getWordsForLevel(level).sort(() => 0.5 - Math.random()),
        currentIndex: 0,
        mistakes: 0,
        score: 0,
        combo: 0,
        maxCombo: 0,
        message: "",
        anim: null as 'player' | 'enemy' | null,
        shake: false,
        wrongWordIds: [] as number[]
    });
    
    const [options, setOptions] = useState<Word[]>([]);
    const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
    
    const currentWord = battleState.words[battleState.currentIndex];

    // Initialize/Reset for new word
    useEffect(() => {
        if (!currentWord) return;
        setOptions(generateOptions(currentWord));
        // Reset timer for scoring
        startTimeRef.current = Date.now();
        setTimeLeft(TIME_LIMIT);
        
        // Small delay to allow render before speak
        const timer = setTimeout(() => AudioEngine.speak(currentWord.word), 500);
        return () => clearTimeout(timer);
    }, [battleState.currentIndex, currentWord]);

    // Countdown Timer Effect
    useEffect(() => {
        // Stop timer if game over, transitioning, or paused
        if (!currentWord || battleState.message || battleState.anim || battleState.hp <= 0 || battleState.enemyHp <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Handle timeout immediately
                    handleTimeout(); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentWord, battleState.message, battleState.anim, battleState.hp, battleState.enemyHp]);

    const handleTimeout = () => {
        AudioEngine.playDamage();
        const dmg = 34; 
        const newHp = Math.max(0, battleState.hp - dmg);
        
        setBattleState(prev => {
            const newWrongIds = [...prev.wrongWordIds];
            if (currentWord && !newWrongIds.includes(currentWord.id)) {
                newWrongIds.push(currentWord.id);
            }
            return {
                ...prev,
                hp: newHp,
                mistakes: prev.mistakes + 1,
                combo: 0, 
                message: `时间到!`, 
                anim: 'enemy',
                shake: true,
                wrongWordIds: newWrongIds
            };
        });

        setTimeout(() => {
            setBattleState(prev => ({ ...prev, shake: false, anim: null }));
            if (newHp <= 0) {
                AudioEngine.playFail();
                onLose([...battleState.wrongWordIds, currentWord.id], battleState.score); 
            } else {
                setOptions(generateOptions(currentWord));
                setBattleState(prev => ({ ...prev, message: "" }));
                startTimeRef.current = Date.now(); 
                setTimeLeft(TIME_LIMIT); 
            }
        }, 1000);
    };

    const handleAnswer = (ans: Word) => {
        if (ans.id === currentWord.id) {
            AudioEngine.playAttack();
            const dmg = Math.ceil(enemyMaxHP / 10 * 1.2);
            const newEnemyHp = Math.max(0, battleState.enemyHp - dmg);

            // --- Scoring Logic ---
            const now = Date.now();
            const timeTaken = (now - startTimeRef.current) / 1000; // seconds
            
            // Base score for a correct answer
            const baseScore = 100;
            
            // Time Bonus: Start at 50, decrease by 10 per second. Min 0.
            const timeBonus = Math.max(0, Math.floor(50 - (timeTaken * 5)));
            
            // Combo Multiplier: +10% score for every point of combo
            // Combo starts at 0. 1st hit -> 1. 2nd hit -> 2.
            const multiplier = 1 + (battleState.combo * 0.1);
            
            const hitScore = Math.round((baseScore + timeBonus) * multiplier);
            const newCombo = battleState.combo + 1;

            setBattleState(prev => ({
                ...prev,
                enemyHp: newEnemyHp,
                score: prev.score + hitScore,
                combo: newCombo,
                maxCombo: Math.max(prev.maxCombo, newCombo),
                message: newCombo > 1 ? `连击 x${newCombo}!` : "好样的!",
                anim: 'player'
            }));

            setTimeout(() => {
                if (newEnemyHp <= 0) {
                    AudioEngine.playWin();
                    const finalScore = battleState.score + hitScore + (battleState.hp * 5); 
                    onWin(battleState.mistakes, finalScore, battleState.wrongWordIds);
                } else {
                    setBattleState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1, message: "", anim: null }));
                }
            }, 800);
        } else {
            AudioEngine.playDamage();
            const dmg = 34; 
            const newHp = Math.max(0, battleState.hp - dmg);
            
            setBattleState(prev => {
                const newWrongIds = [...prev.wrongWordIds];
                if (!newWrongIds.includes(currentWord.id)) {
                    newWrongIds.push(currentWord.id);
                }
                return {
                    ...prev,
                    hp: newHp,
                    mistakes: prev.mistakes + 1,
                    combo: 0, // Reset combo on miss
                    message: `错啦!`, 
                    anim: 'enemy',
                    shake: true,
                    wrongWordIds: newWrongIds
                };
            });

            setTimeout(() => {
                setBattleState(prev => ({ ...prev, shake: false, anim: null }));
                if (newHp <= 0) {
                    AudioEngine.playFail();
                    onLose([...battleState.wrongWordIds, currentWord.id], battleState.score); 
                } else {
                    setOptions(generateOptions(currentWord));
                    setBattleState(prev => ({ ...prev, message: "" }));
                    // Reset timer on wrong answer retry
                    startTimeRef.current = Date.now(); 
                    setTimeLeft(TIME_LIMIT);
                }
            }, 1000);
        }
    };

    if (!currentWord) return <div>加载中...</div>;

    const optionColors = [
        "bg-red-500 border-red-700 text-white",
        "bg-blue-500 border-blue-700 text-white",
        "bg-green-500 border-green-700 text-white",
        "bg-yellow-400 border-yellow-600 text-black"
    ];

    const timerColor = timeLeft < 5 ? 'bg-red-600 text-white animate-pulse' : 'bg-black/40 text-white';

    return (
          <div className={`h-[100dvh] bg-sky-300 flex flex-col overflow-hidden select-none font-sans ${battleState.shake ? 'animate-shake' : ''}`}>
              {/* Top Bar */}
              <div className="bg-gray-900 text-white p-2 flex justify-between items-center z-10 shadow-md border-b-4 border-black shrink-0">
                  <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={onExit} className="px-2 py-1 text-xs"><ArrowLeft/></Button>
                      <div className="flex flex-col leading-tight">
                        <div className="font-black text-yellow-400 flex items-center gap-1 text-base"><Trophy size={16}/> Lv.{level}</div>
                        <div className="font-mono text-xs text-gray-400">最高: {currentPlayer.highScores?.[level] || 0}</div>
                      </div>
                  </div>

                  {/* Score/XP Display */}
                  <div className="flex flex-col items-center">
                    <div className="text-2xl font-black text-white tracking-widest drop-shadow-md flex items-center gap-2">
                        <span>{battleState.score}</span>
                        <span className="text-sm text-yellow-300 font-bold">XP</span>
                    </div>
                    {battleState.combo > 1 && (
                        <div className="text-xs font-black text-yellow-400 animate-bounce uppercase">
                            🔥 连击 x{battleState.combo}
                        </div>
                    )}
                  </div>

                  <div className="flex gap-1">
                      {[1,2,3].map(h => (
                          <Heart key={h} size={24} className={h <= (3 - battleState.mistakes) ? "text-red-500 fill-red-500" : "text-gray-700 fill-gray-700"} />
                      ))}
                  </div>
              </div>

              {/* Visual Area - reduced height to 24vh (20% reduction from 30vh) */}
              <div className={`h-[24vh] shrink-0 relative flex items-center justify-between px-4 sm:px-12 py-2 ${world.bgPattern}`}>
                  {/* Timer Display - Centered Top */}
                  <div className={`absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full border border-white/20 font-black z-30 shadow-lg ${timerColor}`}>
                      <Clock size={16} /> {timeLeft}s
                  </div>

                  <div className={`flex flex-col items-center transition-transform duration-200 ${battleState.anim === 'player' ? 'translate-x-12 scale-110 z-20' : ''}`}>
                        <div className="w-24 sm:w-32 mb-1">
                            <ProgressBar current={battleState.hp} max={100} color="bg-green-500" label="我" />
                        </div>
                        <PlayerAvatar avatar={currentPlayer.avatar} size="md" className="border-4 border-white shadow-2xl" />
                  </div>

                  {battleState.message && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black border-4 border-black px-6 py-4 rounded-md font-black text-3xl animate-bounce z-40 whitespace-nowrap shadow-xl">
                          {battleState.message}
                      </div>
                  )}

                  <div className={`flex flex-col items-center transition-transform duration-200 ${battleState.anim === 'enemy' ? '-translate-x-12 scale-110 z-20' : ''}`}>
                      <div className="w-24 sm:w-32 mb-1">
                          <ProgressBar current={battleState.enemyHp} max={enemyMaxHP} color="bg-red-500" label="首领" reverse />
                      </div>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-md border-4 border-red-900 flex items-center justify-center text-6xl shadow-xl mt-1">
                          {world.img}
                      </div>
                  </div>
              </div>

              {/* Answer Area - takes remaining space */}
              <div className="flex-1 bg-gray-100 p-3 sm:p-4 border-t-8 border-gray-400 flex flex-col pb-4 sm:pb-6">
                  <div className="flex flex-col items-center mb-3 shrink-0">
                      <button onClick={() => AudioEngine.speak(currentWord.word)} className="bg-white border-4 border-gray-300 text-gray-800 px-6 py-2 rounded-lg flex items-center gap-2 text-lg font-black shadow-sm active:scale-95">
                          <Volume2 size={28}/> 听音辨字
                      </button>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 h-full">
                      {options.map((opt, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleAnswer(opt)} 
                            className={`h-full rounded-md border-b-8 font-black text-[4.2rem] sm:text-[5rem] shadow-md active:scale-95 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center ${optionColors[i % 4]}`}
                          >
                              {opt.word}
                          </button>
                      ))}
                  </div>
              </div>
          </div>
    );
};
export default SinglePlayerBattle;