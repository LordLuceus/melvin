import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Roll } from "./Roll";
import { User } from "./User";

@Entity()
export class Guild {
  @PrimaryColumn({ length: 18 })
  id: string;

  @ManyToMany(() => User, (user) => user.guilds, {
    eager: true,
    cascade: true,
  })
  users: User[];

  @OneToMany(() => Roll, (roll) => roll.guild, { eager: true })
  rolls: Roll[];
}
