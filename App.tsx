import React, { useState, useEffect } from 'react';
import { Player, VersusConfig, BattleResult } from './types';
import { WORLDS, TOTAL_LEVELS, AVATARS, getXpForNextLevel, ACHIEVEMENTS } from './constants';
import { AudioEngine } from './utils/audio';
import UserSelect from './components/views/UserSelect';
import SinglePlayerBattle from './components/views/Battle';
import VersusSetup from './components/views/VersusSetup';
import VersusGame from './components/views/VersusGame';
import Leaderboard from './components/views/Leaderboard';
import MistakePractice from './components/views/MistakePractice';
import Achievements from './components/views/Achievements';
import { Button, Card, PlayerAvatar, ProgressBar } from './components/UI';
import { Sword, Users, Home, Star, Lock, ArrowLeft, ArrowRight, RefreshCcw, BarChart, BookOpen } from './components/Icons';

function App() {
  const [appState, setAppState] = useState<'SPLASH' | 'USER_SELECT' | 'MENU' | 'WORLD_SELECT' | 'LEVEL_SELECT' | 'BATTLE' | 'VERSUS_SETUP' | 'VERSUS_GAME' | 'RESULT' | 'LEADERBOARD' | 'MISTAKE_PRACTICE' | 'ACHIEVEMENTS'>('SPLASH'); 
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [versusConfig, setVersusConfig] = useState<VersusConfig | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null); 

  useEffect(() => {
      const savedPlayers = JSON.parse(localStorage.getItem('hanzi_players_cn') || '[]');
      // Migration for old data (ensure highScores, totalScore, mistakes, level, xp, achievements exist)
      const migratedPlayers = savedPlayers.map((p: any) => ({
          ...p,
          highScores: p.highScores || {},
          totalScore: p.totalScore || 0,
          mistakes: p.mistakes || [],
          level: p.level || 1,
          xp: p.xp || 0,
          unlockedAchievements: p.unlockedAchievements || []
      }));
      if (migratedPlayers.length > 0) setPlayers(migratedPlayers);
  }, []);

  const savePlayers = (newPlayers: Player[]) => {
      setPlayers(newPlayers);
      localStorage.setItem('hanzi_players_cn', JSON.stringify(newPlayers));
  };

  const createPlayer = (name: string, avatar: string) => {
      const newPlayer: Player = {
          id: Date.now(),
          name,
          avatar,
          maxUnlockedLevel: 1,
          stars: {},
          highScores: {},
          totalScore: 0,
          mistakes: [],
          level: 1,
          xp: 0,
          unlockedAchievements: []
      };
      const updatedPlayers = [...players, newPlayer];
      savePlayers(updatedPlayers);
      setCurrentPlayer(newPlayer);
      setAppState('MENU');
  };

  const resetGame = () => {
      localStorage.removeItem('hanzi_players_cn');
      setPlayers([]);
      setCurrentPlayer(null);
      setAppState('SPLASH');
      setTimeout(() => window.location.reload(), 100);
  };

  const checkAchievements = (p: Player): number[] => {
      const newUnlocked: number[] = [];
      ACHIEVEMENTS.forEach(ach => {
          if (!p.unlockedAchievements.includes(ach.id) && ach.condition(p)) {
              newUnlocked.push(ach.id);
          }
      });
      return newUnlocked;
  };

  const updatePlayerProgress = (pid: number, level: number, stars: number, score: number, newMistakeIds: number[], isWin: boolean) => {
      let leveledUp = false;
      let newLevel = 1;

      const updated = players.map(p => {
          if (p.id === pid) {
              const newStars = { ...p.stars };
              const newHighScores = { ...p.highScores };
              
              if (isWin) {
                  if (!newStars[level] || stars > newStars[level]) {
                      newStars[level] = stars;
                  }
                  
                  // Handle High Score
                  const currentHighScore = newHighScores[level] || 0;
                  if (score > currentHighScore) {
                      newHighScores[level] = score;
                  }
              }

              // Recalculate Total Score
              const totalScore = Object.values(newHighScores).reduce((a: number, b: number) => a + b, 0);

              // XP Calculation (XP = Score gained, regardless of win/loss)
              let currentXp = p.xp + score;
              let currentLvl = p.level;
              const oldLvl = currentLvl;
              let needed = getXpForNextLevel(currentLvl);
              
              // Level Up Loop
              while (currentXp >= needed) {
                  currentXp -= needed;
                  currentLvl++;
                  needed = getXpForNextLevel(currentLvl);
              }

              if (currentLvl > oldLvl) {
                  leveledUp = true;
                  newLevel = currentLvl;
              }

              // Update Mistakes (Add unique new mistakes)
              const existingMistakes = new Set(p.mistakes || []);
              newMistakeIds.forEach(id => existingMistakes.add(id));
              const mistakes = Array.from(existingMistakes);

              let maxLvl = p.maxUnlockedLevel;
              if (isWin) {
                 const nextLevel = level + 1;
                 maxLvl = Math.max(p.maxUnlockedLevel, nextLevel);
              }
              
              let updatedPlayer = { 
                  ...p, 
                  stars: newStars, 
                  highScores: newHighScores,
                  totalScore: totalScore,
                  maxUnlockedLevel: Math.min(maxLvl, TOTAL_LEVELS),
                  mistakes,
                  xp: currentXp,
                  level: currentLvl
              };

              // Check Achievements
              const newAchievements = checkAchievements(updatedPlayer);
              if (newAchievements.length > 0) {
                  updatedPlayer.unlockedAchievements = [...updatedPlayer.unlockedAchievements, ...newAchievements];
              }

              return updatedPlayer;
          }
          return p;
      });
      savePlayers(updated);
      if (currentPlayer && currentPlayer.id === pid) {
          setCurrentPlayer(updated.find(p => p.id === pid) || null);
      }
      return { leveledUp, newLevel };
  };

  const removePlayerMistake = (wordId: number) => {
      if (!currentPlayer) return;
      const updated = players.map(p => {
          if (p.id === currentPlayer.id) {
              const mistakes = (p.mistakes || []).filter(id => id !== wordId);
              return { ...p, mistakes };
          }
          return p;
      });
      savePlayers(updated);
      setCurrentPlayer(updated.find(p => p.id === currentPlayer.id) || null);
  };

  // Helper to find global high score for a level
  const getGlobalHighScore = (level: number) => {
      let max = 0;
      players.forEach(p => {
          const s = p.highScores?.[level] || 0;
          if (s > max) max = s;
      });
      return max;
  };


  if (appState === 'SPLASH') {
      return (
          <div className="h-[100dvh] w-full bg-gradient-to-b from-[#ff9900] to-[#ffcc00] flex flex-col items-center justify-center animate-fadeIn select-none overflow-hidden cursor-pointer" onClick={() => setAppState('USER_SELECT')}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                  <div className="text-9xl mb-8 animate-bounce drop-shadow-2xl filter brightness-110">⚔️</div>
                  <h1 className="text-6xl sm:text-8xl font-black text-[#ffe160] uppercase tracking-wider mb-4 text-center text-stroke-lg leading-tight" style={{ fontFamily: 'sans-serif' }}>
                      汉字<br/>大乱斗
                  </h1>
                  <div className="text-white font-black uppercase tracking-widest text-xl sm:text-3xl mb-12 text-stroke bg-black/30 px-6 py-2 rounded-full border-2 border-white/50 backdrop-blur-sm">
                      Clash of Hanzi
                  </div>
                  <div className="animate-pulse text-white font-black text-2xl text-stroke-sm">点击开始战斗</div>
              </div>
          </div>
      );
  }

  if (appState === 'USER_SELECT') {
      return <UserSelect 
          players={players} 
          avatars={AVATARS} 
          onSelect={(p) => { setCurrentPlayer(p); setAppState('MENU'); }} 
          onCreate={createPlayer} 
          onReset={resetGame}
      />;
  }

  const menuBg = "bg-[#71a329] bg-[radial-gradient(#83c226_15%,transparent_16%)] bg-[length:20px_20px]";

  if (appState === 'MENU') {
      if (!currentPlayer) return <div>错误: 没有角色</div>;
      
      const xpNeeded = getXpForNextLevel(currentPlayer.level);

      return (
          <div className={`h-[100dvh] ${menuBg} flex items-center justify-center p-4`}>
              <Card className="max-w-md w-full p-6 text-center bg-[#f0f0f0]">
                  <div className="mb-2 flex items-center justify-center gap-4 -mt-10">
                       {/* Level Badge */}
                       <div className="relative">
                            <PlayerAvatar avatar={currentPlayer.avatar} size="lg" className="border-4 border-[#ffd700] shadow-2xl z-10" />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 border-2 border-blue-400 text-white font-black w-12 h-12 flex items-center justify-center rounded-full text-xl z-20 shadow-lg">
                                {currentPlayer.level}
                            </div>
                       </div>
                  </div>
                  
                  <h1 className="text-3xl font-black text-gray-800 mb-1 mt-4 uppercase text-stroke-sm text-white drop-shadow-md">
                      {currentPlayer.name}
                  </h1>

                  {/* XP Bar */}
                  <div className="mb-4 px-4">
                      <div className="w-full h-4 bg-gray-700 rounded-full border border-gray-500 relative overflow-hidden">
                          <div 
                            className="h-full bg-blue-400 transition-all duration-500"
                            style={{ width: `${(currentPlayer.xp / xpNeeded) * 100}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                              XP {Math.floor(currentPlayer.xp)} / {xpNeeded}
                          </div>
                      </div>
                  </div>

                  {/* HUGE SCORE DISPLAY */}
                  <div className="mb-6 bg-[#333] p-4 rounded-xl border-4 border-[#555] shadow-inner">
                      <div className="text-gray-400 text-xs font-bold uppercase mb-1">总积分 Total Score</div>
                      <div className="text-[#ffe160] font-black text-5xl tracking-widest text-stroke-sm drop-shadow-xl">
                          {currentPlayer.totalScore.toLocaleString()}
                      </div>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => setAppState('WORLD_SELECT')} className="w-full text-base py-5 shadow-xl flex-col gap-1 border-b-8">
                            <Sword size={28} /> 单人冒险
                        </Button>
                        <Button onClick={() => setAppState('VERSUS_SETUP')} variant="danger" className="w-full text-base py-5 shadow-xl flex-col gap-1 border-b-8">
                            <Users size={28} /> 双人对战
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Button onClick={() => setAppState('MISTAKE_PRACTICE')} variant="info" className="w-full text-base py-4 shadow-xl flex-col gap-1 border-b-8">
                             <BookOpen size={24} /> 错题本
                             <span className="text-xs bg-black/40 px-2 rounded-full border border-white/20">{currentPlayer.mistakes?.length || 0}</span>
                        </Button>
                        {/* Leaderboard Button - Fixed styling in UI.tsx to be readable */}
                        <Button onClick={() => setAppState('LEADERBOARD')} variant="warning" className="w-full text-base py-4 shadow-xl flex-col gap-1 border-b-8">
                            <BarChart size={24} /> 排行榜
                        </Button>
                      </div>

                      <Button onClick={() => setAppState('ACHIEVEMENTS')} variant="secondary" className="w-full py-3 shadow-lg border-b-8 text-black">
                           <Star size={24} className="text-yellow-500 fill-yellow-500" /> 成就
                           <span className="text-xs bg-gray-700 text-white px-2 rounded-full">
                               {currentPlayer.unlockedAchievements.length}
                           </span>
                      </Button>
                      
                      <Button onClick={() => { setCurrentPlayer(null); setAppState('USER_SELECT'); }} variant="secondary" className="w-full mt-2 py-2 text-sm bg-gray-200 border-gray-400 text-gray-600">
                          切换角色
                      </Button>
                  </div>
              </Card>
          </div>
      );
  }

  if (appState === 'ACHIEVEMENTS') {
      if (!currentPlayer) return null;
      return <Achievements player={currentPlayer} onBack={() => setAppState('MENU')} />;
  }

  if (appState === 'MISTAKE_PRACTICE') {
      if (!currentPlayer) return null;
      return <MistakePractice 
          player={currentPlayer} 
          onRemoveMistake={removePlayerMistake}
          onExit={() => setAppState('MENU')}
      />;
  }

  if (appState === 'LEADERBOARD') {
      if (!currentPlayer) return null;
      return <Leaderboard 
          players={players} 
          currentPlayerId={currentPlayer.id} 
          onBack={() => setAppState('MENU')} 
      />;
  }

  if (appState === 'VERSUS_SETUP') {
      if (!currentPlayer) return null;
      return <VersusSetup 
          currentPlayer={currentPlayer} 
          avatars={AVATARS} 
          onBack={() => setAppState('MENU')}
          onStart={(config) => {
              setVersusConfig(config);
              setAppState('VERSUS_GAME');
          }}
      />;
  }

  if (appState === 'VERSUS_GAME') {
      if (!versusConfig) return null;
      return <VersusGame 
          config={versusConfig} 
          onExit={() => setAppState('MENU')} 
      />;
  }

  if (appState === 'WORLD_SELECT') {
      if (!currentPlayer) return null;
      return (
          <div className={`h-[100dvh] bg-[#5e8b22] flex flex-col`}>
              <div className="bg-[#3e5f15] p-4 text-white flex items-center justify-between shadow-lg z-10 border-b-4 border-[#2d460e]">
                  <Button variant="secondary" onClick={() => setAppState('MENU')} className="px-3"><Home size={20}/></Button>
                  <div className="flex flex-col items-center">
                      <h2 className="text-2xl font-black uppercase text-stroke truncate">选择战场</h2>
                      <div className="text-xs text-yellow-300 font-bold">等级 {currentPlayer.level}</div>
                  </div>
                  <div className="bg-black/40 px-3 py-1 rounded flex items-center gap-2 border border-white/20">
                      <Star className="text-yellow-400" size={16}/>
                      <span className="font-bold">{currentPlayer.maxUnlockedLevel-1}/{TOTAL_LEVELS}</span>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {WORLDS.map(w => {
                      const startLvl = (w.id - 1) * 10 + 1;
                      const isUnlocked = currentPlayer.maxUnlockedLevel >= startLvl;
                      return (
                          <button 
                              key={w.id} 
                              onClick={() => { if(isUnlocked) { setSelectedWorld(w.id); setAppState('LEVEL_SELECT'); } }}
                              disabled={!isUnlocked}
                              className={`w-full relative rounded-xl overflow-hidden shadow-xl border-4 text-left transition-transform active:scale-95 ${isUnlocked ? 'border-black/30' : 'bg-gray-600 border-gray-800 grayscale opacity-80'}`}
                          >
                              <div className={`p-6 ${w.theme} text-white flex items-center gap-4`}>
                                  <div className="text-6xl drop-shadow-md">{w.img}</div>
                                  <div>
                                      <div className="text-2xl font-black uppercase text-stroke">{w.name}</div>
                                      <div className={`text-sm font-bold opacity-90`}>{w.desc}</div>
                                      <div className="mt-2 text-xs bg-black/30 inline-block px-2 py-1 rounded border border-white/20">
                                          关卡 {startLvl}-{startLvl+9}
                                      </div>
                                  </div>
                                  {!isUnlocked && <Lock className="ml-auto text-gray-400" size={32} />}
                              </div>
                          </button>
                      );
                  })}
              </div>
          </div>
      );
  }

  if (appState === 'LEVEL_SELECT') {
      if (!currentPlayer) return null;
      const world = WORLDS.find(w => w.id === selectedWorld);
      if (!world) return null;

      const startLvl = (selectedWorld - 1) * 10 + 1;
      const levels = Array.from({length: 10}, (_, i) => startLvl + i);

      return (
          <div className={`h-[100dvh] ${world.theme} flex flex-col`}>
              <div className="bg-black/30 p-4 text-white flex items-center justify-between backdrop-blur-md border-b-4 border-black/20">
                  <Button variant="secondary" onClick={() => setAppState('WORLD_SELECT')} className="px-3"><ArrowLeft/></Button>
                  <h2 className="text-2xl font-black uppercase text-stroke">{world.name}</h2>
                  <div className="text-4xl drop-shadow-lg">{world.img}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {levels.map(lvl => {
                          const isUnlocked = lvl <= currentPlayer.maxUnlockedLevel;
                          const stars = currentPlayer.stars[lvl] || 0;
                          const highScore = currentPlayer.highScores?.[lvl] || 0;
                          const globalBest = getGlobalHighScore(lvl);

                          return (
                              <button 
                                  key={lvl}
                                  onClick={() => { if(isUnlocked) { setCurrentLevel(lvl); setAppState('BATTLE'); } }}
                                  disabled={!isUnlocked}
                                  className={`aspect-square rounded-xl border-b-8 flex flex-col items-center justify-center relative shadow-lg active:scale-95 transition-transform ${isUnlocked ? 'bg-[#ffe160] border-[#cda200] text-black' : 'bg-[#999] border-[#666] text-[#ccc]'}`}
                              >
                                  <span className="text-3xl font-black mb-1 text-stroke-sm text-white">{lvl}</span>
                                  <div className="flex gap-0.5 mb-1">
                                      {[1,2,3].map(s => (
                                          <Star key={s} size={10} className={s <= stars ? "text-orange-500 fill-orange-500 stroke-black stroke-2" : "text-gray-400 fill-gray-400"} />
                                      ))}
                                  </div>
                                  
                                  {/* Score Display Area */}
                                  {isUnlocked && (
                                      <div className="w-full px-1 flex flex-col items-center gap-0.5">
                                          {highScore > 0 && (
                                              <div className="text-[10px] font-bold bg-white/40 px-1 rounded text-black w-full flex justify-between">
                                                 <span className="opacity-70">我:</span><span>{highScore}</span>
                                              </div>
                                          )}
                                          {globalBest > 0 && (
                                               <div className="text-[10px] font-bold bg-red-100/60 px-1 rounded text-red-900 w-full flex justify-between border border-red-200/50">
                                                  <span className="opacity-70">最强:</span><span>{globalBest}</span>
                                               </div>
                                          )}
                                      </div>
                                  )}

                                  {!isUnlocked && <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center"><Lock className="text-white/80"/></div>}
                              </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      );
  }

  if (appState === 'BATTLE') {
      if (!currentPlayer || currentLevel === null) return null;
      return <SinglePlayerBattle 
          level={currentLevel} 
          currentPlayer={currentPlayer}
          onWin={(mistakes, score, wrongWordIds) => {
              const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
              const { leveledUp, newLevel } = updatePlayerProgress(currentPlayer.id, currentLevel, stars, score, wrongWordIds, true);
              setBattleResult({ status: 'WIN', stars, score, leveledUp, newLevel });
              if (leveledUp) {
                  setTimeout(() => AudioEngine.playLevelUp(), 500);
              }
              setAppState('RESULT');
          }}
          onLose={(wrongWordIds, score) => {
              const { leveledUp, newLevel } = updatePlayerProgress(currentPlayer.id, currentLevel, 0, score, wrongWordIds, false);
              setBattleResult({ status: 'LOSE', stars: 0, score, leveledUp, newLevel });
              if (leveledUp) {
                  setTimeout(() => AudioEngine.playLevelUp(), 500);
              }
              setAppState('RESULT');
          }}
          onExit={() => setAppState('LEVEL_SELECT')}
      />;
  }

  if (appState === 'RESULT') {
      if (!battleResult) return null;
      const isWin = battleResult.status === 'WIN';
      const xpNeeded = getXpForNextLevel(currentPlayer?.level || 1);

      return (
          <div className="h-[100dvh] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <Card className={`max-w-sm w-full p-8 text-center border-8 ${isWin ? 'bg-[#fff5cc] border-[#ffe160]' : 'bg-gray-300 border-gray-500'}`}>
                  {/* CoC Style Sunburst behind result */}
                  <div className="text-8xl mb-4 animate-bounce relative z-10">{isWin ? '🏆' : '💀'}</div>
                  <h2 className="text-4xl font-black mb-2 uppercase text-stroke text-white drop-shadow-lg relative z-10">{isWin ? '胜利!' : '失败'}</h2>
                  
                  {battleResult.leveledUp && (
                       <div className="my-4 animate-bounce relative z-20">
                           <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 uppercase drop-shadow-sm text-stroke-sm tracking-tighter filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                               Level Up!
                           </div>
                           <div className="text-white font-black text-2xl text-stroke drop-shadow-md">
                               Lv.{battleResult.newLevel! - 1} ➔ <span className="text-yellow-300">Lv.{battleResult.newLevel}</span>
                           </div>
                       </div>
                  )}

                  {isWin && (
                      <div className="flex flex-col items-center gap-2 mb-2 relative z-10">
                          <div className="flex justify-center gap-2">
                            {[1,2,3].map(s => (
                                <Star key={s} size={40} className={s <= battleResult.stars ? "text-yellow-400 fill-yellow-400 drop-shadow-md stroke-black stroke-1" : "text-gray-400 fill-gray-400"} />
                            ))}
                          </div>
                      </div>
                  )}

                  {/* XP Bar in Result Screen - Visual Feedback for XP gain */}
                  <div className="mb-6 relative z-10">
                       <div className="w-full bg-gray-700 h-6 rounded-full relative overflow-hidden border-2 border-gray-600 shadow-inner">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000" 
                            style={{width: `${currentPlayer ? (currentPlayer.xp / xpNeeded) * 100 : 0}%`}}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-black uppercase text-stroke-sm">
                              XP +{battleResult.score} {battleResult.leveledUp && "(LEVEL UP!)"}
                          </div>
                       </div>
                       {currentPlayer && (
                           <div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1">
                               <span>Lv.{currentPlayer.level}</span>
                               <span>{Math.floor(currentPlayer.xp)} / {xpNeeded}</span>
                           </div>
                       )}
                  </div>

                  <div className="space-y-4 relative z-10">
                      {isWin && (
                          <Button onClick={() => setAppState('LEVEL_SELECT')} variant="success" className="w-full text-lg py-3">
                              继续 <ArrowRight/>
                          </Button>
                      )}
                      {!isWin && (
                          <Button onClick={() => setAppState('BATTLE')} variant="primary" className="w-full text-lg py-3">
                              重试 <RefreshCcw/>
                          </Button>
                      )}
                      <Button onClick={() => setAppState('LEVEL_SELECT')} variant="secondary" className="w-full">
                          返回地图
                      </Button>
                  </div>
              </Card>
          </div>
      );
  }

  return <div>未知状态</div>;
}

export default App;