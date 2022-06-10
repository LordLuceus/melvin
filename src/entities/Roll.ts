import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Guild } from "./Guild";
import { User } from "./User";

@Entity()
export class Roll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  value: string;

  @ManyToOne(() => User, (user) => user.rolls, {
    onDelete: "CASCADE",
  })
  user: User;

  @ManyToOne(() => Guild, (guild) => guild.rolls, { onDelete: "CASCADE" })
  guild: Guild;
}
