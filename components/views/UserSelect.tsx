import React, { useState } from 'react';
import { Player } from '../../types';
import { Button, Card, PlayerAvatar } from '../UI';
import { UserPlus } from '../Icons';

interface UserSelectProps {
    players: Player[];
    avatars: string[];
    onSelect: (p: Player) => void;
    onCreate: (name: string, avatar: string) => void;
    onReset: () => void;
}

const UserSelect: React.FC<UserSelectProps> = ({ players, onSelect, onCreate, avatars, onReset }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(avatars[0]);
  const [confirmingReset, setConfirmingReset] = useState(false);

  const handleCreate = () => {
      if (!newName.trim()) return;
      onCreate(newName, newAvatar);
  };

  // CoC Background Pattern
  const bgClass = "bg-[#71a329] bg-[radial-gradient(#83c226_15%,transparent_16%)] bg-[length:20px_20px]";

  return (
      <div className={`h-[100dvh] ${bgClass} p-4 flex flex-col items-center justify-center font-sans`}>
          <Card className="max-w-md w-full p-6 bg-[#f0f0f0]">
              <h2 className="text-2xl font-black text-center mb-6 uppercase text-stroke text-white drop-shadow-md">
                  {isCreating ? "创建新角色" : "选择角色"}
              </h2>
              
              {!isCreating ? (
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
                          {players.map(p => (
                              <button key={p.id} onClick={() => onSelect(p)} className="flex flex-col items-center p-3 bg-white rounded-lg border-2 border-gray-300 hover:bg-blue-50 transition-colors shadow-sm active:scale-95">
                                  <PlayerAvatar avatar={p.avatar} size="md" />
                                  <span className="font-bold mt-2 truncate w-full text-center text-gray-800">{p.name}</span>
                                  <span className="text-xs text-gray-500 font-bold">关卡 {p.maxUnlockedLevel}</span>
                              </button>
                          ))}
                      </div>
                      <Button onClick={() => setIsCreating(true)} variant="success" className="w-full">
                          <UserPlus size={20} /> 新建角色
                      </Button>
                      
                      {players.length > 0 && (
                          <div className="pt-4 border-t-2 border-gray-300 mt-2">
                              {!confirmingReset ? (
                                  <Button 
                                      onClick={() => setConfirmingReset(true)} 
                                      variant="danger"
                                      className="w-full text-sm py-2"
                                  >
                                      ⚠️ 重置所有游戏数据
                                  </Button>
                              ) : (
                                  <div className="flex flex-col gap-2 p-2 bg-red-100 rounded-lg border border-red-300 animate-fadeIn">
                                      <div className="text-center text-red-800 font-bold text-sm mb-1">确定删除所有数据吗？此操作无法撤销。</div>
                                      <div className="flex gap-2">
                                        <Button onClick={() => setConfirmingReset(false)} variant="secondary" className="flex-1 py-2 text-sm">
                                            取消
                                        </Button>
                                        <Button onClick={onReset} variant="danger" className="flex-1 py-2 text-sm">
                                            确定删除
                                        </Button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="space-y-4">
                      <div className="flex justify-center mb-4">
                          <PlayerAvatar avatar={newAvatar} size="lg" className="scale-110" />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin px-2">
                          {avatars.map(a => (
                              <button key={a} onClick={() => setNewAvatar(a)} className={`text-4xl p-2 rounded-lg flex-shrink-0 transition-all ${newAvatar === a ? 'bg-yellow-200 border-4 border-yellow-500 scale-110' : 'bg-gray-200 border-2 border-gray-300 grayscale opacity-70'}`}>
                                  {a}
                              </button>
                          ))}
                      </div>
                      <input 
                          type="text" 
                          placeholder="输入你的名字" 
                          className="w-full p-4 border-4 border-gray-300 rounded-lg font-bold text-center text-xl shadow-inner bg-white focus:border-[#ffb02e] outline-none"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                      />
                      <div className="flex gap-2 mt-4">
                          <Button onClick={() => setIsCreating(false)} variant="secondary" className="flex-1">取消</Button>
                          <Button onClick={handleCreate} variant="success" className="flex-1" disabled={!newName.trim()}>创建</Button>
                      </div>
                  </div>
              )}
          </Card>
      </div>
  );
};
export default UserSelect;