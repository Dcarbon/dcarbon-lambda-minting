import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EDeviceCreditActionType } from '@enums/device.enum';

@Entity('device_transaction_history')
class DeviceTransactionHistoryEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'device_transaction_history_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('dth_signature_idx', { unique: true })
  signature: string;

  @Column({ type: 'varchar', nullable: true })
  mint?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('dth_project_id_idx')
  project_id: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('dth_device_id_idx')
  device_id: string;

  @Column({ type: 'integer', nullable: true })
  nonce?: string;

  @Column({ type: 'enum', enum: EDeviceCreditActionType, nullable: false })
  action_type: EDeviceCreditActionType;

  @Column('decimal', { default: 0, precision: 22, scale: 9, nullable: true })
  carbon_amount?: number;

  @Column('decimal', { default: 0, precision: 22, scale: 9, nullable: true })
  fee?: number;

  @Column('decimal', { default: 0, precision: 22, scale: 9, nullable: true })
  dcarbon_amount?: number;

  @Column({ type: 'timestamptz', nullable: true })
  tx_time?: string | Date | null;

  @Column({ type: 'varchar', nullable: false })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { DeviceTransactionHistoryEntity };
