import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { HolidaysEntity } from 'cts-entities';

import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';

const entities = TypeOrmModule.forFeature([HolidaysEntity]);

const services = [];

@Module({
  imports: [entities, ...services],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
