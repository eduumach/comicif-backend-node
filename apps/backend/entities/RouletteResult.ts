import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MediaCategory } from '../types/MediaCategory';

@Entity('roulette_result')
export class RouletteResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MediaCategory
  })
  selectedCategory: MediaCategory;

  @Column({ type: 'varchar', length: 255 })
  categoryLabel: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
