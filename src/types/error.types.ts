// src/types/error.types.ts
export interface ErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: Array<{
			field: string;
			message: string;
		}>;
	};
}

export interface SuccessResponse<T = any> {
	success: true;
	data?: T;
	message?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;