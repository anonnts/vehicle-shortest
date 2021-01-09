import { Module } from '@nestjs/common';
import { SolvingController } from './solving/solving.controller';



@Module({
  imports: [],
  controllers: [SolvingController],
  providers: [],
})
export class AppModule { }
