import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tarefas')
export class Tarefa {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  titulo!: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'boolean', default: false })
  concluida!: boolean;

  @CreateDateColumn()
  criadaEm!: Date;

  @UpdateDateColumn()
  atualizadaEm!: Date;
}