export interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'admin' | 'member' | 'guest';
  status: 'active' | 'inactive';
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

const NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Margaret Hamilton',
  'Katherine Johnson',
  'Dennis Ritchie',
  'Barbara Liskov',
  'Donald Knuth',
  'Radia Perlman',
  'Linus Torvalds',
  'Frances Allen',
  'John Backus',
];

const ROLES: Array<DemoUser['role']> = ['admin', 'member', 'guest'];

export function createMockUsers(): Array<DemoUser> {
  return NAMES.map((name, index) => {
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@flextable.dev`;
    const role = ROLES[index % ROLES.length] as DemoUser['role'];
    const createdDaysAgo = 400 - index * 23;
    const updatedDaysAgo = createdDaysAgo - (index % 5) * 10;

    return {
      id: `user-${index + 1}`,
      name,
      email,
      avatarUrl: null,
      role,
      status: index % 4 === 3 ? 'inactive' : 'active',
      loginCount: (index * 7 + 3) % 42,
      createdAt: new Date(Date.now() - createdDaysAgo * 86_400_000).toISOString(),
      updatedAt: new Date(Date.now() - updatedDaysAgo * 86_400_000).toISOString(),
    };
  });
}
