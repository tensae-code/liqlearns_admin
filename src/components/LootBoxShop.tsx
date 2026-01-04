import React, { useEffect, useState } from 'react';
import { Gift, Lock, Sparkles, ChevronRight } from 'lucide-react';
import {
  fetchAvailableLootBoxes,
  purchaseLootBox,
  openLootBox,
  fetchUserLootBoxes,
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

interface LootBox {
  id: string;
  name: string;
  rarity: string;
  cost: number;
  possible_rewards: any[];
  drop_rates: any;
}

const LootBoxShop: React.FC = () => {
  const { user } = useAuth();
  const [availableBoxes, setAvailableBoxes] = useState<LootBox[]>([]);
  const [userBoxes, setUserBoxes] = useState<any[]>([]);
  const [selectedBox, setSelectedBox] = useState<any | null>(null);
  const [opening, setOpening] = useState(false);
  const [rewards, setRewards] = useState<any[] | null>(null);

  useEffect(() => {
    loadBoxes();
  }, [user]);

  const loadBoxes = async () => {
    try {
      const [available, userOwned] = await Promise.all([
        fetchAvailableLootBoxes(),
        user ? fetchUserLootBoxes(user.id) : Promise.resolve([]),
      ]);
      setAvailableBoxes(available);
      setUserBoxes(userOwned);
    } catch (error) {
      console.error('Failed to load loot boxes:', error);
    }
  };

  const handlePurchase = async (lootBoxId: string) => {
    if (!user) return;
    try {
      await purchaseLootBox(user.id, lootBoxId);
      alert('Loot box purchased successfully!');
      loadBoxes();
    } catch (error: any) {
      alert(error.message || 'Failed to purchase loot box');
    }
  };

  const handleOpen = async (userLootBoxId: string) => {
    setOpening(true);
    try {
      const result = await openLootBox(userLootBoxId);
      setRewards(result);
      setTimeout(() => {
        setRewards(null);
        loadBoxes();
      }, 5000);
    } catch (error: any) {
      alert(error.message || 'Failed to open loot box');
    } finally {
      setOpening(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Rewards Animation */}
      {rewards && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-bounce-in">
            <div className="text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-500 animate-pulse" />
              <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
              <div className="space-y-2">
                {rewards.map((reward: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                  >
                    <div className="font-bold text-lg">
                      {reward.amount} {reward.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Loot Boxes */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-600" />
          Loot Box Shop
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableBoxes.map((box) => (
            <div
              key={box.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div
                className={`h-40 bg-gradient-to-br ${getRarityColor(
                  box.rarity
                )} flex items-center justify-center`}
              >
                <Gift className="w-20 h-20 text-white" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{box.name}</h3>
                <div className="mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      box.rarity === 'common' ?'bg-gray-500'
                        : box.rarity === 'rare' ?'bg-blue-500'
                        : box.rarity === 'epic' ?'bg-purple-500' :'bg-yellow-500'
                    }`}
                  >
                    {box.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="mb-4 text-sm text-gray-600">
                  <p className="font-semibold mb-1">Possible Rewards:</p>
                  <ul className="space-y-1">
                    {box.possible_rewards?.slice(0, 3).map((reward: any, idx: number) => (
                      <li key={idx}>
                        • {reward.amount} {reward.type}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => handlePurchase(box.id)}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Buy for {box.cost} gold</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Loot Boxes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Loot Boxes</h2>
        {userBoxes.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">You don't have any loot boxes yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {userBoxes.map((userBox) => (
              <div
                key={userBox.id}
                className={`bg-white rounded-lg shadow p-4 ${
                  userBox.opened ? 'opacity-50' : ''
                }`}
              >
                <div
                  className={`h-32 bg-gradient-to-br ${getRarityColor(
                    userBox.loot_box.rarity
                  )} rounded-lg flex items-center justify-center mb-3`}
                >
                  <Gift className="w-12 h-12 text-white" />
                </div>
                <h4 className="font-bold text-center mb-2">
                  {userBox.loot_box.name}
                </h4>
                {!userBox.opened ? (
                  <button
                    onClick={() => handleOpen(userBox.id)}
                    disabled={opening}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {opening ? 'Opening...' : 'Open'}
                  </button>
                ) : (
                  <div className="text-center text-sm text-gray-500">
                    Opened
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LootBoxShop;