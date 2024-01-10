import { type Credentials } from '../Credentials';

export interface AcceptsCredentials {
  setCredentials(credentials: Credentials): void;
}
