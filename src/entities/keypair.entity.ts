import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Expose } from 'class-transformer';
import { EKeypairType } from '@enums/keypair.enum';

@Entity('keypair')
class KeypairEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'keypair_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('keypair_public_k_idx', { unique: true })
  public_key: string;

  @Column({ type: 'text', nullable: true })
  private_key?: string;

  @Column({ type: 'varchar', nullable: true })
  aws_sm_key?: string;

  @Column({ type: 'enum', enum: EKeypairType, nullable: false })
  type: EKeypairType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  created_by?: string;

  @Column({ type: 'varchar', nullable: true })
  updated_by?: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  @Expose({ groups: ['list'] })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { KeypairEntity };
