// src/types/auth.types.ts
export interface User {
	id: number;
	username: string;
	email: string;
	roles: string[];
}

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

export interface LoginResponse {
	token: string;
	user: User;
}

export interface RefreshTokenResponse {
	token: string;
}