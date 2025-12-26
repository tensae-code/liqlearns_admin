import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { MLMNode } from '../types';

interface MLMGenealogyTreeProps {
  rootNode: MLMNode;
  onNodeClick: (node: MLMNode) => void;
  onNodeExpand: (nodeId: string) => void;
  className?: string;
}

const MLMGenealogyTree = ({ 
  rootNode, 
  onNodeClick, 
  onNodeExpand, 
  className = '' 
}: MLMGenealogyTreeProps) => {
  const [selectedLeg, setSelectedLeg] = useState<'A' | 'B' | 'C' | 'D' | 'all'>('all');

  const getLevelColor = (level: MLMNode['level']) => {
    const colors = {
      'Student': 'border-blue-300 bg-blue-50',
      'Trainee Seller': 'border-green-300 bg-green-50',
      'Salesman': 'border-yellow-300 bg-yellow-50',
      'Team Leader': 'border-purple-300 bg-purple-50',
      'Supervisor': 'border-indigo-300 bg-indigo-50',
      'Journeyman': 'border-pink-300 bg-pink-50',
      'Brand Ambassador': 'border-orange-300 bg-orange-50',
      'Ambassador': 'border-red-300 bg-red-50'
    };
    return colors[level];
  };

  const getLegColor = (leg: MLMNode['leg']) => {
    const colors = {
      'A': 'bg-blue-500',
      'B': 'bg-green-500',
      'C': 'bg-yellow-500',
      'D': 'bg-red-500'
    };
    return colors[leg];
  };

  const renderNode = (node: MLMNode, depth: number = 0) => {
    const hasChildren = node.children.length > 0;
    const isFiltered = selectedLeg !== 'all' && node.leg !== selectedLeg;

    if (isFiltered && depth > 0) return null;

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-card ${getLevelColor(node.level)} ${
            depth === 0 ? 'w-64' : 'w-48'
          }`}
          onClick={() => onNodeClick(node)}
        >
          {/* Leg Indicator */}
          {depth > 0 && (
            <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full ${getLegColor(node.leg)} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{node.leg}</span>
            </div>
          )}

          {/* User Info */}
          <div className="flex items-center space-x-3 mb-3">
            <Image
              src={node.profileImage}
              alt={node.profileImageAlt}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-body font-semibold text-sm text-foreground truncate">
                {node.username}
              </p>
              <p className="font-caption text-xs text-muted-foreground truncate">
                {node.fullName}
              </p>
            </div>
          </div>

          {/* Level Badge */}
          <div className="mb-2">
            <span className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              {node.level}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Aura Points:</span>
              <p className="font-data font-medium text-foreground">
                {node.auraPoints.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Downline:</span>
              <p className="font-data font-medium text-foreground">
                {node.totalDownline}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Monthly Volume:</span>
              <p className="font-data font-medium text-foreground">
                ETB {node.monthlyVolume.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Expand Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-card border border-border"
              onClick={(e) => {
                e.stopPropagation();
                onNodeExpand(node.id);
              }}
            >
              <Icon 
                name={node.isExpanded ? 'ChevronUp' : 'ChevronDown'} 
                size={16} 
              />
            </Button>
          )}
        </div>

        {/* Children */}
        {hasChildren && node.isExpanded && (
          <div className="mt-8">
            <div className="flex justify-center mb-4">
              <div className="w-px h-6 bg-border"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-card rounded-lg border border-border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading font-semibold text-lg text-foreground">
          MLM Genealogy Tree
        </h3>
        
        {/* Leg Filter */}
        <div className="flex items-center space-x-2">
          <span className="font-body text-sm text-muted-foreground">Filter by leg:</span>
          <div className="flex items-center space-x-1">
            {(['all', 'A', 'B', 'C', 'D'] as const).map((leg) => (
              <button
                key={leg}
                onClick={() => setSelectedLeg(leg)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedLeg === leg
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {leg === 'all' ? 'All' : `Leg ${leg}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="font-body text-sm text-muted-foreground">Legs:</span>
          {(['A', 'B', 'C', 'D'] as const).map((leg) => (
            <div key={leg} className="flex items-center space-x-1">
              <div className={`w-3 h-3 rounded-full ${getLegColor(leg)}`}></div>
              <span className="font-caption text-xs text-foreground">{leg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="overflow-x-auto">
        <div className="min-w-full flex justify-center">
          {renderNode(rootNode)}
        </div>
      </div>

      {/* Mobile View Helper */}
      <div className="lg:hidden mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span>Scroll horizontally to view the full tree structure</span>
        </div>
      </div>
    </div>
  );
};

export default MLMGenealogyTree;