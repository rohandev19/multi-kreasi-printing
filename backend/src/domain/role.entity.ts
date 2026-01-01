export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly permissions: string[],
    public readonly description?: string,
  ) {}
}
