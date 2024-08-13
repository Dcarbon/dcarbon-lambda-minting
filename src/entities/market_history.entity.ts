import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('market_tx_history')
class MarketTransactionHistoryEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'market_history_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('mh_signature_idx', { unique: true })
  signature: string;

  @Column({ type: 'varchar', nullable: true })
  seller?: string;

  @Column({ type: 'varchar', nullable: true })
  @Index('mh_buyer_idx')
  buyer?: string;

  @Column({ type: 'varchar', nullable: false })
  mint: string;

  @Column({ type: 'varchar', nullable: true })
  project_id?: string;

  @Column('decimal', { default: 0, precision: 22, scale: 9, nullable: true })
  amount?: number;

  @Column({ type: 'varchar', nullable: true })
  currency?: string;

  @Column('decimal', { default: 0, precision: 22, scale: 9, nullable: true })
  payment_total?: number;

  @Column({ type: 'timestamptz', nullable: true })
  tx_time?: string | Date | null;

  @Column({ type: 'varchar', nullable: false })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { MarketTransactionHistoryEntity };
