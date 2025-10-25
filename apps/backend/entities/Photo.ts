import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Prompt } from './Prompt';

@Entity('photo')
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 1000 })
    path: string;

    @Column({ type: 'int', default: 0 })
    likes: number;

    @Column({ type: 'varchar', length: 50, default: 'generated' })
    type: 'generated' | 'original';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Prompt, (prompt) => prompt.photos, { nullable: true })
    prompt: Prompt;
}