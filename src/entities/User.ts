import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { Guild } from "./Guild";
import { Roll } from "./Roll";

@Entity()
export class User {
  @PrimaryColumn({ length: 20 })
  id: string;

  @ManyToMany(() => Guild, (guild) => guild.users, { onDelete: "CASCADE" })
  @JoinTable()
  guilds: Guild[];

  @OneToMany(() => Roll, (roll) => roll.user)
  rolls: Roll[];
}
