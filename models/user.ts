export interface UserModel {
  access_token: string;
  user: User;
}

interface User {
  _id: string;
  email: string;
  password: string;
  role: string;
  name: string;
  library: string[];
  image: string;
  __v: number;
}
