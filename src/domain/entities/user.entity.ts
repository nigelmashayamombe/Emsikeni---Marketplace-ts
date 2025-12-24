import { AccountStatus } from '../enums/account-status.enum';
import { Role } from '../enums/role.enum';
import { Email } from '../value-objects/email.vo';
import { PhoneNumber } from '../value-objects/phone.vo';

export type UserProps = {
  id?: string;
  email: Email;
  phone: PhoneNumber;
  passwordHash?: string;
  role: Role;
  status?: AccountStatus;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isSuperAdmin?: boolean;
  fullName?: string;
  address?: string;
  gender?: string;
  dateOfBirth?: Date;
  nationalId?: string;
  invitationId?: string | null;
};

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    return new User({
      ...props,
      status: props.status ?? AccountStatus.PENDING,
      emailVerified: props.emailVerified ?? false,
      phoneVerified: props.phoneVerified ?? false,
      isSuperAdmin: props.isSuperAdmin ?? false,
    });
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get email(): string {
    return this.props.email.getValue();
  }

  get phone(): string {
    return this.props.phone.getValue();
  }

  get role(): Role {
    return this.props.role;
  }

  get status(): AccountStatus | undefined {
    return this.props.status;
  }

  get passwordHash(): string | undefined {
    return this.props.passwordHash;
  }

  get emailVerified(): boolean {
    return Boolean(this.props.emailVerified);
  }

  get phoneVerified(): boolean {
    return Boolean(this.props.phoneVerified);
  }

  get isActive(): boolean {
    return this.status === AccountStatus.ACTIVE;
  }

  shouldAutoActivate(): boolean {
    return (
      this.emailVerified &&
      this.phoneVerified &&
      (this.role === Role.BUYER || this.role === Role.ADMIN || this.role === Role.SUPER_ADMIN)
    );
  }

  canLogin(): boolean {
    return (
      this.emailVerified &&
      this.phoneVerified &&
      this.status === AccountStatus.ACTIVE
    );
  }

  withPasswordHash(hash: string): User {
    return User.create({ ...this.props, passwordHash: hash });
  }
}

