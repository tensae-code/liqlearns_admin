import React from 'react';

interface LoginFooterProps {
  className?: string;
}

const LoginFooter = ({ className = '' }: LoginFooterProps) => {
  return (
    <div className={`text-center mt-8 ${className}`}>
      <p className="font-caption text-xs text-muted-foreground">
        © 2026 LiqLearns. All rights reserved.
      </p>
    </div>
  );
};

export default LoginFooter;