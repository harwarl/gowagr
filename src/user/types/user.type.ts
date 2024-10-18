import { User } from 'src/user/entities/user.entity';

export type UserType = Omit<User, 'hashPassword'>;
