import { Column, Entity, ManyToMany, OneToMany, PrimaryColumn } from "typeorm";
import { Roll } from "./Roll";
import { User } from "./User";

@Entity()
export class Guild {
  @PrimaryColumn({ length: 20 })
  id: string;

  @ManyToMany(() => User, (user) => user.guilds)
  users: User[];

  @OneToMany(() => Roll, (roll) => roll.guild)
  rolls: Roll[];

  @Column({ nullable: true, length: 20 })
  gmChannel?: string;
}
