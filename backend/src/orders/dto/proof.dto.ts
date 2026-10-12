import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateProofDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul bukti cetak (proof) harus diisi' })
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  designerNotes?: string;

  @IsString()
  @IsNotEmpty({ message: 'File URL bukti cetak harus disertakan' })
  fileUrl!: string;

  @IsString()
  @IsNotEmpty({ message: 'R2 Path bukti cetak harus disertakan' })
  r2Path!: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}

export class ApproveProofDto {
  @IsBoolean()
  @IsNotEmpty({ message: 'Persetujuan disclaimer cetak harus dicentang' })
  agreedToDisclaimer!: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  customerNotes?: string;
}

export class RejectProofDto {
  @IsString()
  @IsNotEmpty({ message: 'Alasan penolakan atau catatan revisi wajib diisi' })
  @MaxLength(1000)
  customerNotes!: string;
}
