import React, { useEffect, useState } from 'react';
import { CheckCircle, Lock, ChevronRight } from 'lucide-react';
import {
  fetchSkillTrees,
  fetchUserSkillProgress,
  unlockSkillNode,
} from '../services/gamificationService';
import { useAuth } from '../contexts/AuthContext';

interface SkillNode {
  id: string;
  name: string;
  unlocked?: boolean;
  requires?: string[];
  description?: string;
  xp_cost?: number;
}

const SkillTreeVisualization: React.FC = () => {
  const { user } = useAuth();
  const [skillTrees, setSkillTrees] = useState<any[]>([]);
  const [selectedTree, setSelectedTree] = useState<any | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [nodes, setNodes] = useState<SkillNode[]>([]);

  useEffect(() => {
    loadSkillTrees();
  }, []);

  useEffect(() => {
    if (selectedTree && user) {
      loadUserProgress();
    }
  }, [selectedTree, user]);

  const loadSkillTrees = async () => {
    try {
      const data = await fetchSkillTrees();
      setSkillTrees(data);
      if (data.length > 0) {
        setSelectedTree(data[0]);
      }
    } catch (error) {
      console.error('Failed to load skill trees:', error);
    }
  };

  const loadUserProgress = async () => {
    if (!user || !selectedTree) return;
    try {
      const progress = await fetchUserSkillProgress(user.id, selectedTree.id);
      setUserProgress(progress);

      const treeNodes = selectedTree.tree_data?.nodes || [];
      const unlockedNodes = progress?.unlocked_nodes || [];

      const processedNodes = treeNodes.map((node: SkillNode) => ({
        ...node,
        unlocked: unlockedNodes.includes(node.id),
      }));

      setNodes(processedNodes);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const handleUnlockNode = async (nodeId: string) => {
    if (!user || !selectedTree) return;

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Check requirements
    if (node.requires && node.requires.length > 0) {
      const requirementsMet = node.requires.every((reqId) =>
        nodes.find((n) => n.id === reqId)?.unlocked
      );

      if (!requirementsMet) {
        alert('You must unlock required nodes first!');
        return;
      }
    }

    try {
      await unlockSkillNode(user.id, selectedTree.id, nodeId);
      alert('Skill node unlocked successfully!');
      loadUserProgress();
    } catch (error: any) {
      alert(error.message || 'Failed to unlock skill node');
    }
  };

  const canUnlockNode = (node: SkillNode) => {
    if (node.unlocked) return false;

    if (!node.requires || node.requires.length === 0) return true;

    return node.requires.every((reqId) =>
      nodes.find((n) => n.id === reqId)?.unlocked
    );
  };

  return (
    <div className="space-y-6">
      {/* Skill Tree Selector */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {skillTrees.map((tree) => (
          <button
            key={tree.id}
            onClick={() => setSelectedTree(tree)}
            className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
              selectedTree?.id === tree.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tree.name}
          </button>
        ))}
      </div>

      {selectedTree && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tree Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">{selectedTree.name}</h2>
            <p className="text-gray-600">{selectedTree.description}</p>
            {userProgress && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">Progress</span>
                  <span className="text-sm text-gray-600">
                    {userProgress.progress_percentage?.toFixed(0) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                    style={{
                      width: `${userProgress.progress_percentage || 0}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Skill Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nodes.map((node, index) => {
              const isUnlockable = canUnlockNode(node);

              return (
                <div
                  key={node.id}
                  className={`relative p-6 rounded-lg border-2 transition-all ${
                    node.unlocked
                      ? 'border-green-500 bg-green-50'
                      : isUnlockable
                      ? 'border-purple-300 bg-white hover:border-purple-500 cursor-pointer' :'border-gray-300 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => isUnlockable && handleUnlockNode(node.id)}
                >
                  {/* Status Icon */}
                  <div className="absolute top-4 right-4">
                    {node.unlocked ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : isUnlockable ? (
                      <ChevronRight className="w-6 h-6 text-purple-500" />
                    ) : (
                      <Lock className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Node Content */}
                  <h3 className="font-bold text-lg mb-2 pr-8">{node.name}</h3>
                  {node.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {node.description}
                    </p>
                  )}

                  {/* Requirements */}
                  {node.requires && node.requires.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        Requires:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {node.requires.map((reqId) => {
                          const reqNode = nodes.find((n) => n.id === reqId);
                          return (
                            <span
                              key={reqId}
                              className={`text-xs px-2 py-1 rounded ${
                                reqNode?.unlocked
                                  ? 'bg-green-100 text-green-700' :'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {reqNode?.name || reqId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* XP Cost */}
                  {node.xp_cost && !node.unlocked && (
                    <div className="text-sm font-semibold text-purple-600">
                      Cost: {node.xp_cost} XP
                    </div>
                  )}

                  {/* Unlock Button */}
                  {isUnlockable && !node.unlocked && (
                    <button className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Unlock
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeVisualization;