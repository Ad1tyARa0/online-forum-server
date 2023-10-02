import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Length } from "class-validator";

@Entity({ name: "Users" })
export class User {
  @PrimaryGeneratedColumn({ name: "Id", type: "bigint" })
  Id: string;

  @Column("varchar", {
    name: "Email",
    length: 120,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column("varchar", {
    name: "UserName",
    length: 60,
    unique: true,
    nullable: false,
  })
  userName: string;

  @Column("varchar", { name: "Password", length: 100, nullable: false })
  @Length(8, 100)
  password: string;

  @Column("boolean", { name: "Confirmed", default: false, nullable: false })
  confirmed: boolean;

  @Column("boolean", { name: "IsDisabled", default: false, nullable: false })
  isDisabled: boolean;
}
