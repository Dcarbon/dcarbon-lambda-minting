import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EMintScheduleType } from '@enums/minting.enum';

@Entity('minting_schedule')
class MintingScheduleEntity {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'minting_schedule_pk' })
  id?: string;

  @Column({ type: 'varchar', nullable: false })
  @Index('ms_project_id_idx', { unique: true })
  project_id: string;

  @Column({ type: 'enum', enum: EMintScheduleType, default: EMintScheduleType.DAILY })
  @Index('ms_schedule_type_idx')
  schedule_type: EMintScheduleType;

  @Column({ type: 'timestamptz', nullable: true })
  schedule_time?: string | Date | null;

  @Column({ type: 'varchar', nullable: true })
  created_by?: string;

  @Column({ type: 'varchar', nullable: true })
  updated_by?: string;

  @CreateDateColumn({ type: 'timestamptz', nullable: true })
  created_at?: string;

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updated_at?: string;
}

export { MintingScheduleEntity };
