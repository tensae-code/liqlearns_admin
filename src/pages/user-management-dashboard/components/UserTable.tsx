import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { User, UserTableColumn, SortConfig, BanAction } from '../types';

interface UserTableProps {
  users: User[];
  onUserClick: (user: User) => void;
  onBanAction: (action: BanAction) => void;
  onSortChange: (sortConfig: SortConfig) => void;
  sortConfig: SortConfig;
  className?: string;
}

const UserTable = ({ 
  users, 
  onUserClick, 
  onBanAction, 
  onSortChange, 
  sortConfig, 
  className = '' 
}: UserTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const columns: UserTableColumn[] = [
    { key: 'username', label: 'Username', sortable: true, width: '15%' },
    { key: 'fullName', label: 'Full Name', sortable: true, width: '20%' },
    { key: 'email', label: 'Email', sortable: true, width: '20%' },
    { key: 'sponsor', label: 'Sponsor', sortable: true, width: '15%' },
    { key: 'currentLevel', label: 'Level', sortable: true, width: '12%' },
    { key: 'auraPoints', label: 'Aura Points', sortable: true, width: '10%' },
    { key: 'accountStatus', label: 'Status', sortable: true, width: '8%' },
    { key: 'actions', label: 'Actions', sortable: false, width: '10%' }
  ];

  const handleSort = (key: keyof User) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ key, direction });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length 
        ? [] 
        : users.map(user => user.id)
    );
  };

  const getStatusBadge = (status: User['accountStatus']) => {
    const statusConfig = {
      active: { color: 'bg-success text-success-foreground', label: 'Active' },
      pending: { color: 'bg-warning text-warning-foreground', label: 'Pending' },
      banned: { color: 'bg-destructive text-destructive-foreground', label: 'Banned' },
      temporary_ban: { color: 'bg-orange-500 text-white', label: 'Temp Ban' },
      suspended: { color: 'bg-muted text-muted-foreground', label: 'Suspended' }
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getLevelBadge = (level: User['currentLevel']) => {
    const levelColors = {
      'Student': 'bg-blue-100 text-blue-800',
      'Trainee Seller': 'bg-green-100 text-green-800',
      'Salesman': 'bg-yellow-100 text-yellow-800',
      'Team Leader': 'bg-purple-100 text-purple-800',
      'Supervisor': 'bg-indigo-100 text-indigo-800',
      'Journeyman': 'bg-pink-100 text-pink-800',
      'Brand Ambassador': 'bg-orange-100 text-orange-800',
      'Ambassador': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${levelColors[level]}`}>
        {level}
      </span>
    );
  };

  const handleBanAction = (user: User, actionType: BanAction['type']) => {
    onBanAction({
      userId: user.id,
      type: actionType,
      reason: actionType === 'ban' ? 'Manual admin action' : undefined,
      duration: actionType === 'temporary_ban' ? 7 : undefined,
      adminId: 'admin-001',
      timestamp: new Date()
    });
  };

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg text-foreground">
            User Management ({users.length} users)
          </h3>
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="font-body text-sm text-muted-foreground">
                {selectedUsers.length} selected
              </span>
              <Button variant="outline" size="sm" iconName="Check">
                Bulk Approve
              </Button>
              <Button variant="destructive" size="sm" iconName="Ban">
                Bulk Ban
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left p-4 font-body font-medium text-sm text-muted-foreground"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key as keyof User)}
                      className="flex items-center space-x-1 hover:text-foreground transition-colors"
                    >
                      <span>{column.label}</span>
                      <Icon
                        name={
                          sortConfig.key === column.key
                            ? sortConfig.direction === 'asc' ?'ChevronUp' :'ChevronDown' :'ChevronsUpDown'
                        }
                        size={14}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onUserClick(user)}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    className="rounded border-border"
                  />
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={user.profileImage}
                      alt={user.profileImageAlt}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-body font-medium text-sm text-foreground">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-body text-sm text-foreground">{user.fullName}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{user.email}</td>
                <td className="p-4 font-body text-sm text-foreground">{user.sponsor}</td>
                <td className="p-4">{getLevelBadge(user.currentLevel)}</td>
                <td className="p-4 font-data text-sm text-foreground">
                  {user.auraPoints.toLocaleString()}
                </td>
                <td className="p-4">{getStatusBadge(user.accountStatus)}</td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    {user.accountStatus === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBanAction(user, 'approve')}
                        title="Approve User"
                      >
                        <Icon name="Check" size={16} className="text-success" />
                      </Button>
                    )}
                    {user.accountStatus === 'active' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBanAction(user, 'temporary_ban')}
                          title="Temporary Ban"
                        >
                          <Icon name="Clock" size={16} className="text-warning" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleBanAction(user, 'ban')}
                          title="Permanent Ban"
                        >
                          <Icon name="Ban" size={16} className="text-destructive" />
                        </Button>
                      </>
                    )}
                    {(user.accountStatus === 'banned' || user.accountStatus === 'temporary_ban') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleBanAction(user, 'unban')}
                        title="Unban User"
                      >
                        <Icon name="UserCheck" size={16} className="text-success" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onUserClick(user)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-border"
                />
                <Image
                  src={user.profileImage}
                  alt={user.profileImageAlt}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-body font-medium text-sm text-foreground">
                    {user.username}
                  </p>
                  <p className="font-caption text-xs text-muted-foreground">
                    {user.fullName}
                  </p>
                </div>
              </div>
              {getStatusBadge(user.accountStatus)}
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-body text-foreground truncate">{user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sponsor:</span>
                <p className="font-body text-foreground">{user.sponsor}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Level:</span>
                <div className="mt-1">{getLevelBadge(user.currentLevel)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Aura Points:</span>
                <p className="font-data text-foreground">{user.auraPoints.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2" onClick={(e) => e.stopPropagation()}>
              {user.accountStatus === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBanAction(user, 'approve')}
                  iconName="Check"
                >
                  Approve
                </Button>
              )}
              {user.accountStatus === 'active' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBanAction(user, 'temporary_ban')}
                    iconName="Clock"
                  >
                    Temp Ban
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBanAction(user, 'ban')}
                    iconName="Ban"
                  >
                    Ban
                  </Button>
                </>
              )}
              {(user.accountStatus === 'banned' || user.accountStatus === 'temporary_ban') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBanAction(user, 'unban')}
                  iconName="UserCheck"
                >
                  Unban
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
            No Users Found
          </h3>
          <p className="font-body text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserTable;