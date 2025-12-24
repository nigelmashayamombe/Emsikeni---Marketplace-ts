export class Password {
  private constructor(private readonly value: string) {}

  static create(value: string): Password {
    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
      throw new Error('Password must include upper, lower case letters and digits');
    }
    return new Password(value);
  }

  getValue(): string {
    return this.value;
  }
}

