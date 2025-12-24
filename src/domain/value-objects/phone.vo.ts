export class PhoneNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): PhoneNumber {
    const normalized = value.replace(/\s+/g, '');
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(normalized)) {
      throw new Error('Invalid phone number');
    }
    return new PhoneNumber(normalized);
  }

  getValue(): string {
    return this.value;
  }
}

