import { PartialType } from '@nestjs/mapped-types';
import { CreateDismissalDto } from './create-dismissal.dto';

export class UpdateDismissalDto extends PartialType(CreateDismissalDto) {
  id: number;
}
