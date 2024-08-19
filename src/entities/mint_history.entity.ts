import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('mint_history')
class MintHistoryEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'mint_history_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  signature: string;

  @Column({ type: 'varchar', nullable: false })
  mint: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('mh_owner_idx')
  owner: string;

  @Column({ type: 'timestamptz', nullable: true })
  tx_time?: string | Date | null;

  @Column({ type: 'varchar', nullable: false })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { MintHistoryEntity };
