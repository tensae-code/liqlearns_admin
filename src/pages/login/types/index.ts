export interface LoginFormData {
  username: string;
  password: string;
}

export interface LoginFormErrors {
  username?: string;
  password?: string;
  general?: string;
}

export interface LoginState {
  isLoading: boolean;
  showPassword: boolean;
  rememberMe: boolean;
}

export interface MockCredentials {
  username: string;
  password: string;
  role: 'admin' | 'student' | 'teacher' | 'support' | 'ceo';
}