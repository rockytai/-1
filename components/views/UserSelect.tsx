import React, { useState } from 'react';
import { Player } from '../../types';
import { Button, Card, PlayerAvatar } from '../UI';
import { UserPlus } from '../Icons';

interface UserSelectProps {
    players: Player[];
    avatars: string[];
    onSelect: (p: Player) => void;
    onCreate: (name: string, avatar: string) => void;
}

const UserSelect: React.FC<UserSelectProps> = ({ players, onSelect, onCreate, avatars }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(avatars[0]);

  const handleCreate = () => {
      if (!newName.trim()) return;
      onCreate(newName, newAvatar);
  };

  return (
      <div className="h-[100dvh] bg-sky-200 p-4 flex flex-col items-center justify-center">
          <Card className="max-w-md w-full p-6 bg-white/90">
              <h2 className="text-2xl font-black text-center mb-6 uppercase text-gray-800">
                  {isCreating ? "创建新角色" : "选择角色"}
              </h2>
              
              {!isCreating ? (
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto p-2">
                          {players.map(p => (
                              <button key={p.id} onClick={() => onSelect(p)} className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200 hover:bg-blue-100 transition-colors">
                                  <PlayerAvatar avatar={p.avatar} size="md" />
                                  <span className="font-bold mt-2 truncate w-full text-center">{p.name}</span>
                                  <span className="text-xs text-gray-500">关卡 {p.maxUnlockedLevel}</span>
                              </button>
                          ))}
                      </div>
                      <Button onClick={() => setIsCreating(true)} variant="success" className="w-full">
                          <UserPlus size={20} /> 新建角色
                      </Button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <div className="flex justify-center mb-4">
                          <PlayerAvatar avatar={newAvatar} size="lg" />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                          {avatars.map(a => (
                              <button key={a} onClick={() => setNewAvatar(a)} className={`text-2xl p-2 rounded-lg ${newAvatar === a ? 'bg-yellow-200 border-2 border-yellow-500' : 'bg-gray-100'}`}>
                                  {a}
                              </button>
                          ))}
                      </div>
                      <input 
                          type="text" 
                          placeholder="输入你的名字" 
                          className="w-full p-3 border-2 border-gray-300 rounded-lg font-bold text-center"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                      />
                      <div className="flex gap-2">
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
