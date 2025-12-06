import React, { useState, useEffect } from 'react';
import { Player, VersusConfig, BattleResult } from './types';
import { WORLDS, TOTAL_LEVELS, AVATARS } from './constants';
import UserSelect from './components/views/UserSelect';
import SinglePlayerBattle from './components/views/Battle';
import VersusSetup from './components/views/VersusSetup';
import VersusGame from './components/views/VersusGame';
import { Button, Card, PlayerAvatar } from './components/UI';
import { Sword, Users, Home, Star, Lock, ArrowLeft, ArrowRight, RefreshCcw } from './components/Icons';

function App() {
  const [appState, setAppState] = useState<'SPLASH' | 'USER_SELECT' | 'MENU' | 'WORLD_SELECT' | 'LEVEL_SELECT' | 'BATTLE' | 'VERSUS_SETUP' | 'VERSUS_GAME' | 'RESULT'>('SPLASH'); 
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  
  const [selectedWorld, setSelectedWorld] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [versusConfig, setVersusConfig] = useState<VersusConfig | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null); 

  useEffect(() => {
      const savedPlayers = JSON.parse(localStorage.getItem('hanzi_players_cn') || '[]');
      if (savedPlayers.length > 0) setPlayers(savedPlayers);
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
          stars: {}
      };
      const updatedPlayers = [...players, newPlayer];
      savePlayers(updatedPlayers);
      setCurrentPlayer(newPlayer);
      setAppState('MENU');
  };

  const updatePlayerProgress = (pid: number, level: number, stars: number) => {
      const updated = players.map(p => {
          if (p.id === pid) {
              const newStars = { ...p.stars };
              if (!newStars[level] || stars > newStars[level]) {
                  newStars[level] = stars;
              }
              const nextLevel = level + 1;
              const maxLvl = Math.max(p.maxUnlockedLevel, stars > 0 ? nextLevel : p.maxUnlockedLevel);
              return { ...p, stars: newStars, maxUnlockedLevel: Math.min(maxLvl, TOTAL_LEVELS) };
          }
          return p;
      });
      savePlayers(updated);
      if (currentPlayer && currentPlayer.id === pid) {
          setCurrentPlayer(updated.find(p => p.id === pid) || null);
      }
  };

  if (appState === 'SPLASH') {
      return (
          <div className="h-[100dvh] w-full bg-amber-500 flex flex-col items-center justify-center animate-fadeIn select-none overflow-hidden cursor-pointer" onClick={() => setAppState('USER_SELECT')}>
              <div className="text-8xl mb-6 animate-bounce drop-shadow-2xl">⚔️</div>
              <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-md mb-2 text-center">汉字大乱斗</h1>
              <div className="text-amber-800 font-bold uppercase tracking-wide text-sm mb-8">听音认字 RPG</div>
              <div className="animate-pulse text-white font-bold">点击开始</div>
          </div>
      );
  }

  if (appState === 'USER_SELECT') {
      return <UserSelect 
          players={players} 
          avatars={AVATARS} 
          onSelect={(p) => { setCurrentPlayer(p); setAppState('MENU'); }} 
          onCreate={createPlayer} 
      />;
  }

  if (appState === 'MENU') {
      if (!currentPlayer) return <div>错误: 没有角色</div>;
      return (
          <div className="h-[100dvh] bg-sky-400 flex items-center justify-center p-4">
              <Card className="max-w-md w-full p-8 text-center bg-orange-50">
                  <div className="mb-4 flex justify-center">
                      <PlayerAvatar avatar={currentPlayer.avatar} size="lg" className="border-4 border-amber-500" />
                  </div>
                  <h1 className="text-3xl font-black text-amber-900 mb-2">你好, {currentPlayer.name}!</h1>
                  <p className="text-amber-700 mb-8 font-bold">准备好战斗了吗?</p>
                  
                  <div className="space-y-4">
                      <Button onClick={() => setAppState('WORLD_SELECT')} className="w-full text-xl py-4 shadow-xl">
                          <Sword size={24} /> 单人冒险
                      </Button>
                      <Button onClick={() => setAppState('VERSUS_SETUP')} variant="danger" className="w-full text-xl py-4 shadow-xl">
                          <Users size={24} /> 双人对战
                      </Button>
                      <Button onClick={() => { setCurrentPlayer(null); setAppState('USER_SELECT'); }} variant="secondary" className="w-full">
                          切换角色
                      </Button>
                  </div>
              </Card>
          </div>
      );
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
          <div className="h-[100dvh] bg-sky-800 flex flex-col">
              <div className="bg-sky-900 p-4 text-white flex items-center justify-between shadow-lg z-10">
                  <Button variant="secondary" onClick={() => setAppState('MENU')} className="px-3"><Home size={20}/></Button>
                  <h2 className="text-xl font-bold uppercase truncate">选择世界</h2>
                  <div className="bg-black/30 px-3 py-1 rounded flex items-center gap-2">
                      <Star className="text-yellow-400" size={16}/>
                      <span>{currentPlayer.maxUnlockedLevel-1}/{TOTAL_LEVELS}</span>
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
                              className={`w-full relative rounded-xl overflow-hidden shadow-lg border-b-4 text-left transition-transform active:scale-95 ${isUnlocked ? 'border-black/20' : 'bg-gray-600 border-gray-800 grayscale opacity-80'}`}
                          >
                              <div className={`p-6 ${w.theme} text-white flex items-center gap-4`}>
                                  <div className="text-5xl">{w.img}</div>
                                  <div>
                                      <div className="text-2xl font-black uppercase">{w.name}</div>
                                      <div className={`text-sm font-bold ${w.textColor}`}>{w.desc}</div>
                                      <div className="mt-2 text-xs bg-black/20 inline-block px-2 py-1 rounded">
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
              <div className="bg-black/30 p-4 text-white flex items-center justify-between backdrop-blur-md">
                  <Button variant="secondary" onClick={() => setAppState('WORLD_SELECT')} className="px-3"><ArrowLeft/></Button>
                  <h2 className="text-xl font-bold uppercase">{world.name}</h2>
                  <div className="text-3xl">{world.img}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {levels.map(lvl => {
                          const isUnlocked = lvl <= currentPlayer.maxUnlockedLevel;
                          const stars = currentPlayer.stars[lvl] || 0;
                          return (
                              <button 
                                  key={lvl}
                                  onClick={() => { if(isUnlocked) { setCurrentLevel(lvl); setAppState('BATTLE'); } }}
                                  disabled={!isUnlocked}
                                  className={`aspect-square rounded-xl border-b-8 flex flex-col items-center justify-center relative shadow-lg active:scale-95 transition-transform ${isUnlocked ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-gray-400 border-gray-600 text-gray-200'}`}
                              >
                                  <span className="text-3xl font-black mb-1">{lvl}</span>
                                  <div className="flex gap-0.5">
                                      {[1,2,3].map(s => (
                                          <Star key={s} size={12} className={s <= stars ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-300"} />
                                      ))}
                                  </div>
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
          onWin={(mistakes) => {
              const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
              updatePlayerProgress(currentPlayer.id, currentLevel, stars);
              setBattleResult({ status: 'WIN', stars });
              setAppState('RESULT');
          }}
          onLose={() => {
              setBattleResult({ status: 'LOSE', stars: 0 });
              setAppState('RESULT');
          }}
          onExit={() => setAppState('LEVEL_SELECT')}
      />;
  }

  if (appState === 'RESULT') {
      if (!battleResult) return null;
      const isWin = battleResult.status === 'WIN';
      return (
          <div className="h-[100dvh] bg-black/90 flex items-center justify-center p-4">
              <Card className={`max-w-sm w-full p-8 text-center ${isWin ? 'bg-yellow-50' : 'bg-gray-200'}`}>
                  <div className="text-8xl mb-4 animate-bounce">{isWin ? '🏆' : '💀'}</div>
                  <h2 className="text-4xl font-black mb-2 uppercase">{isWin ? '胜利!' : '失败'}</h2>
                  {isWin && (
                      <div className="flex justify-center gap-2 mb-6">
                          {[1,2,3].map(s => (
                              <Star key={s} size={40} className={s <= battleResult.stars ? "text-yellow-500 fill-yellow-500" : "text-gray-400 fill-gray-400"} />
                          ))}
                      </div>
                  )}
                  <div className="space-y-4">
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