export interface TagTranslation {
  id: number;
  tagId: number;
  languageCode: string;
  isDefault: boolean;
  name: string;
}

export interface Tag {
  id: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  translations: TagTranslation[];
}

export interface CreateTagRequest {
  translations: {
    languageCode: string;
    isDefault: boolean;
    name: string;
  }[];
}

export interface UpdateTagRequest {
  translations?: {
    languageCode: string;
    isDefault: boolean;
    name: string;
  }[];
}

export interface TagResponse {
  id: number;
  slug: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TagsListResponse {
  tags: TagResponse[];
  total: number;
  page: number;
  limit: number;
}