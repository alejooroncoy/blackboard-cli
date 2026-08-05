export type CampusAccount = {
  id: string;
  name: string;
  email: string;
  picture?: string;
  universityId?: string;
};

export type CampusAccountSession = {
  account: CampusAccount;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};
