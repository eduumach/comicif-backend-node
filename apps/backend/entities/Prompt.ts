import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Photo } from './Photo';
import { MediaCategory } from '../types/MediaCategory';

@Entity('prompt')
export class Prompt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  person_count: number;

  @Column({
    type: 'enum',
    enum: MediaCategory,
    nullable: true,
    default: null
  })
  category: MediaCategory | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Photo, (photo) => photo.prompt)
  photos: Photo[];
}