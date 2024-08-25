import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EMintingStatus } from '@enums/minting.enum';

@Entity('burn_history')
class BurnHistoryEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'burn_history_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  signature: string;

  @Column({ type: 'varchar', nullable: true })
  mint_signature?: string;

  @Column({ type: 'varchar', nullable: true })
  group_signature?: string;

  @Column({ type: 'varchar', nullable: true })
  block_hash?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('bh_burner_idx')
  burner: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  mints?: string[];

  @Column('decimal', { default: 0, precision: 22, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: EMintingStatus, default: EMintingStatus.MINTING })
  mint_status?: EMintingStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ type: 'timestamptz', nullable: true })
  tx_time?: string | Date | null;

  @Column({ type: 'varchar', nullable: false })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { BurnHistoryEntity };
