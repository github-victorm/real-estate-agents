// Common response type for API endpoints
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// Base entity type that other types can extend
export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Common address type used across the application
export type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};
